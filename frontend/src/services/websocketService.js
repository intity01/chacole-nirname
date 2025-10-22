// src/services/websocketService.js

let ws = null;
let reconnectAttempts = 0;
let currentRoomId = null;
let currentCallbacks = null;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 2000; // 2 seconds
const PING_INTERVAL = 30000; // 30 seconds
let pingIntervalId = null;

// Get WebSocket URL from environment or use default
const getWebSocketURL = (roomId) => {
  // Check if running on localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
    return `${wsUrl}/ws/${roomId}`;
  }
  
  // Production environment - use environment variable or fallback
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'chacole-backend.onrender.com';
  return `wss://${backendUrl}/ws/${roomId}`;
};

// Send ping to keep connection alive
const startPingInterval = () => {
  if (pingIntervalId) {
    clearInterval(pingIntervalId);
  }
  
  pingIntervalId = setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log('📡 Sending ping to keep connection alive');
      sendMessage({ type: 'ping' });
    }
  }, PING_INTERVAL);
};

const stopPingInterval = () => {
  if (pingIntervalId) {
    clearInterval(pingIntervalId);
    pingIntervalId = null;
  }
};

const connect = (roomId, callbacks) => {
  // เก็บ roomId และ callbacks สำหรับ reconnection
  currentRoomId = roomId;
  currentCallbacks = callbacks;
  
  // ปิด WebSocket เดิมก่อน (ถ้ามี)
  if (ws && ws.readyState !== WebSocket.CLOSED) {
    console.log('Closing existing WebSocket connection...');
    stopPingInterval();
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
      startPingInterval(); // Start sending pings
      
      if (callbacks.onOpen) {
        callbacks.onOpen();
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 WebSocket message received:', data);
        
        // Handle pong response
        if (data.type === 'pong') {
          console.log('📡 Received pong from server');
          return;
        }
        
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
      
      stopPingInterval();
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
  stopPingInterval();
  
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

