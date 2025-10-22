// src/services/apiService.js

// Backend URL configuration
const BACKEND_URL = 'chacole-backend.onrender.com';

// Get API URL based on environment
const getApiUrl = () => {
  // Check if running on localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8000';
  }
  
  // Production environment - always use Render.com backend
  return `https://${BACKEND_URL}`;
};

const API_URL = getApiUrl();

const createRoom = async () => {
  try {
    const response = await fetch(`${API_URL}/create-room`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};

const getRoomInfo = async (roomId) => {
  try {
    const response = await fetch(`${API_URL}/room/${roomId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting room info:', error);
    throw error;
  }
};

export const apiService = {
  createRoom,
  getRoomInfo,
};

