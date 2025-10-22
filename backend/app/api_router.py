from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List
import json
import uuid
import asyncio

# Import จากไฟล์อื่นในโปรเจกต์
from .utils import generate_anonymous_name, generate_room_id
from .websocket_manager import active_rooms, active_connections, broadcast_to_room, broadcast_typing, handle_user_disconnect

router = APIRouter()

@router.post("/create-room")
async def create_room():
    """สร้างห้องแชทใหม่"""
    room_id = generate_room_id()
    active_rooms[room_id] = {
        "id": room_id,
        "created_at": asyncio.get_event_loop().time(),
        "participants": [],
        "messages": []  # เก็บข้อความชั่วคราวเฉพาะในเซสชัน
    }
    
    return {
        "room_id": room_id,
        "join_url": f"/room/{room_id}",
        "message": "Room created successfully"
    }

@router.get("/room/{room_id}")
async def get_room_info(room_id: str):
    """ดูข้อมูลห้องแชท"""
    if room_id not in active_rooms:
        return {"error": "Room not found", "room_id": room_id}
    
    room = active_rooms[room_id]
    return {
        "room_id": room_id,
        "participant_count": len(room["participants"]),
        "status": "active"
    }

@router.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    """WebSocket endpoint สำหรับการแชท"""
    await websocket.accept()
    
    # ตรวจสอบว่าห้องมีอยู่หรือไม่
    if room_id not in active_rooms:
        await websocket.send_text(json.dumps({
            "type": "error",
            "message": "Room not found"
        }))
        await websocket.close()
        return
    
    # สร้างชื่อนิรนามและ connection ID
    user_name = generate_anonymous_name()
    connection_id = str(uuid.uuid4())
    
    # เพิ่มผู้ใช้เข้าห้อง
    active_rooms[room_id]["participants"].append({
        "id": connection_id,
        "name": user_name,
        "joined_at": asyncio.get_event_loop().time()
    })
    
    active_connections[connection_id] = websocket
    
    # ส่งข้อมูลการเชื่อมต่อสำเร็จ
    await websocket.send_text(json.dumps({
        "type": "connected",
        "user_name": user_name,
        "room_id": room_id,
        "participant_count": len(active_rooms[room_id]["participants"])
    }))
    
    # แจ้งผู้ใช้อื่นว่ามีคนเข้าร่วม
    await broadcast_to_room(room_id, {
        "type": "user_joined",
        "user_name": user_name,
        "participant_count": len(active_rooms[room_id]["participants"])
    }, exclude_connection=connection_id)
    
    try:
        while True:
            # รับข้อความจากผู้ใช้
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            message_type = message_data.get("type")
            
            # Handle ping/pong for keeping connection alive
            if message_type == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
                continue
            
            if message_type == "message":
                # สร้างข้อความ
                chat_message = {
                    "type": "message",
                    "user_name": user_name,
                    "message": message_data.get("message", ""),
                    "timestamp": asyncio.get_event_loop().time()
                }
                
                # เก็บข้อความในห้อง (ชั่วคราว)
                active_rooms[room_id]["messages"].append(chat_message)
                
                # ส่งข้อความไปยังผู้ใช้ทุกคนในห้อง
                await broadcast_to_room(room_id, chat_message)
                
            elif message_type == "typing":
                # ส่งสถานะการพิมพ์
                is_typing = message_data.get("is_typing", False)
                await broadcast_typing(room_id, user_name, is_typing, exclude_connection=connection_id)
                
    except WebSocketDisconnect:
        # ผู้ใช้ออกจากห้อง
        await handle_user_disconnect(room_id, connection_id, user_name)
