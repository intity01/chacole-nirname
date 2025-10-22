// src/services/apiService.js

// Get API URL based on environment
const getApiUrl = () => {
  // Check if running on localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return import.meta.env.VITE_API_URL || 'http://localhost:8000';
  }
  
  // Production environment - use environment variable or fallback
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'chacole-backend.onrender.com';
  return `https://${backendUrl}`;
};

const API_URL = getApiUrl();

console.log('🔧 API URL configured:', API_URL);

const createRoom = async () => {
  try {
    console.log('📤 Creating room...');
    const response = await fetch(`${API_URL}/create-room`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Room created:', data);
    return data;
  } catch (error) {
    console.error('❌ Error creating room:', error);
    throw error;
  }
};

const getRoomInfo = async (roomId) => {
  try {
    console.log('📤 Getting room info for:', roomId);
    const response = await fetch(`${API_URL}/room/${roomId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Room info received:', data);
    return data;
  } catch (error) {
    console.error('❌ Error getting room info:', error);
    throw error;
  }
};

export const apiService = {
  createRoom,
  getRoomInfo,
};

