// src/services/apiService.js

// Get API URL based on environment
const getApiUrl = () => {
  // Always use production URL in production
  if (import.meta?.env?.PROD) {
    return 'https://chacole-backend.onrender.com';
  }
  
  // Development environment
  return 'http://localhost:8000';
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

