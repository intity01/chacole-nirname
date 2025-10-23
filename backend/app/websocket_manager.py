from fastapi import WebSocket
import json
from typing import Dict, List
import asyncio

# เก็บข้อมูลห้องแชทและการเชื่อมต่อ (ชั่วคราว - ไม่บันทึกลงฐานข้อมูล)
active_rooms: Dict[str, Dict] = {}
active_connections: Dict[str, WebSocket] = {}

async def broadcast_to_room(room_id: str, message: dict, exclude_connection: str = None):
    """ส่งข้อความไปยังผู้ใช้ทุกคนในห้อง"""
    if room_id not in active_rooms:
        return
    
    participants = active_rooms[room_id]["participants"]
    
    for participant in participants:
        if participant["id"] == exclude_connection:
            continue
            
        connection = active_connections.get(participant["id"])
        if connection:
            try:
                await connection.send_text(json.dumps(message))
            except:
                # ปล่อยให้ WebSocketDisconnect ใน api_router.py จัดการการขาดการเชื่อมต่ออย่างเป็นทางการ
                # การจัดการในส่วนนี้อาจทำให้เกิด race condition และไม่สมบูรณ์
                pass

async def broadcast_typing(room_id: str, user_name: str, is_typing: bool, exclude_connection: str = None):
    """ส่งสถานะการพิมพ์ไปยังผู้ใช้อื่นในห้อง"""
    await broadcast_to_room(room_id, {
        "type": "typing",
        "user_name": user_name,
        "is_typing": is_typing
    }, exclude_connection=exclude_connection)

async def handle_user_disconnect(room_id: str, connection_id: str, user_name: str):
    """จัดการเมื่อผู้ใช้ออกจากห้อง"""
    # ลบผู้ใช้จากห้อง
    if room_id in active_rooms:
        active_rooms[room_id]["participants"] = [
            p for p in active_rooms[room_id]["participants"] 
            if p["id"] != connection_id
        ]
        
        # แจ้งผู้ใช้อื่นว่ามีคนออกจากห้อง
        await broadcast_to_room(room_id, {
            "type": "user_left",
            "user_name": user_name,
            "participant_count": len(active_rooms[room_id]["participants"])
        })
        
        # ลบห้องถ้าไม่มีผู้ใช้เหลือ
        if len(active_rooms[room_id]["participants"]) == 0:
            del active_rooms[room_id]
    
    # ลบการเชื่อมต่อ
    if connection_id in active_connections:
        del active_connections[connection_id]
