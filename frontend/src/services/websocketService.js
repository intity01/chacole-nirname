// src/services/websocketService.js

let ws = null;
let reconnectAttempts = 0;
let currentRoomId = null;
let currentCallbacks = null;
const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAY = 2000; // 2 seconds

// Get WebSocket URL for the room
const getWebSocketURL = (roomId) => {
  // Check if running on localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return `ws://localhost:8000/ws/${roomId}`;
  }
  
  // Production environment - always use Render.com backend
  return `wss://chacole-backend.onrender.com/ws/${roomId}`;
  
  // Production: use same host with port 8000
  const port = import.meta?.env?.VITE_API_PORT || '8000';
  return `${protocol}//${host}:${port}/ws/${roomId}`;
};

const connect = (roomId, callbacks) => {
  // เก็บ roomId และ callbacks สำหรับ reconnection
  currentRoomId = roomId;
  currentCallbacks = callbacks;
  
  // ปิด WebSocket เดิมก่อน (ถ้ามี)
  if (ws && ws.readyState !== WebSocket.CLOSED) {
    console.log('Closing existing WebSocket connection...');
    ws.close();
    ws = null;
  }

  const wsURL = getWebSocketURL(roomId);
  console.log('Connecting to WebSocket:', wsURL, `(attempt ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS + 1})`);
  
  try {
    ws = new WebSocket(wsURL);

    ws.onopen = () => {
      console.log('✅ WebSocket connected successfully');
      reconnectAttempts = 0; // reset counter on successful connection
      if (callbacks.onOpen) {
        callbacks.onOpen();
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 WebSocket message received:', data);
        if (callbacks.onMessage) {
          callbacks.onMessage(data);
        }
      } catch (error) {
        console.error('❌ Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = (event) => {
      console.log('🔌 WebSocket connection closed:', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean
      });
      
      ws = null;
      
      // ถ้าปิดแบบไม่ปกติ และยังไม่ถึงจำนวนครั้งสูงสุด ให้ลองเชื่อมต่อใหม่
      if (!event.wasClean && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        console.log(`🔄 Reconnecting... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
        
        setTimeout(() => {
          connect(currentRoomId, currentCallbacks);
        }, RECONNECT_DELAY * reconnectAttempts); // exponential backoff
      } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.error('❌ Max reconnection attempts reached');
        if (callbacks.onError) {
          callbacks.onError(new Error('ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่อีกครั้ง'));
        }
      }
      
      if (callbacks.onClose) {
        callbacks.onClose(event);
      }
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      if (callbacks.onError) {
        callbacks.onError(error);
      }
    };
  } catch (error) {
    console.error('❌ Failed to create WebSocket:', error);
    if (callbacks.onError) {
      callbacks.onError(error);
    }
  }
};

const sendMessage = (message) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    console.log('📤 Sending message:', message);
    ws.send(JSON.stringify(message));
  } else {
    console.error('❌ WebSocket is not connected. Current state:', ws?.readyState);
  }
};

const disconnect = () => {
  console.log('🔌 Disconnecting WebSocket...');
  reconnectAttempts = MAX_RECONNECT_ATTEMPTS; // ป้องกันไม่ให้ reconnect
  if (ws) {
    ws.close();
    ws = null;
  }
  currentRoomId = null;
  currentCallbacks = null;
};

export const websocketService = {
  connect,
  sendMessage,
  disconnect,
};

