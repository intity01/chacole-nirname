// src/services/apiService.js

// Allow overriding API URL via Vite env (VITE_API_URL).
// Auto-detect if running on public domain
const getApiUrl = () => {
  // Check if VITE_API_URL is set
  if (import.meta?.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Auto-detect based on current hostname
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  // If running on Manus VM domain, use the backend port URL
  if (hostname.includes('manusvm.computer') || hostname.includes('manus-asia.computer')) {
    const port = window.location.port || '5173';
    return `${protocol}//${hostname.replace('5173-', '8000-')}`;
  }
  
  // Default to localhost
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

