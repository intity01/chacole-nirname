// src/services/storageService.js

class StorageService {
  constructor() {
    this.ROOM_HISTORY_KEY = 'chacole_room_history';
    this.MAX_HISTORY = 10;
  }

  // บันทึกห้องที่เคยเข้า
  saveRoomHistory(roomId, roomName = null) {
    try {
      const history = this.getRoomHistory();
      
      // ลบห้องเดิมออก (ถ้ามี)
      const filtered = history.filter(item => item.roomId !== roomId);
      
      // เพิ่มห้องใหม่ที่ด้านบน
      filtered.unshift({
        roomId,
        roomName: roomName || `ห้อง ${roomId}`,
        timestamp: Date.now(),
        lastVisit: new Date().toLocaleString('th-TH')
      });
      
      // เก็บแค่ MAX_HISTORY ห้องล่าสุด
      const trimmed = filtered.slice(0, this.MAX_HISTORY);
      
      localStorage.setItem(this.ROOM_HISTORY_KEY, JSON.stringify(trimmed));
      return true;
    } catch (error) {
      console.error('Failed to save room history:', error);
      return false;
    }
  }

  // ดึงประวัติห้องที่เคยเข้า
  getRoomHistory() {
    try {
      const data = localStorage.getItem(this.ROOM_HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get room history:', error);
      return [];
    }
  }

  // ลบห้องออกจากประวัติ
  removeFromHistory(roomId) {
    try {
      const history = this.getRoomHistory();
      const filtered = history.filter(item => item.roomId !== roomId);
      localStorage.setItem(this.ROOM_HISTORY_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Failed to remove from history:', error);
      return false;
    }
  }

  // ล้างประวัติทั้งหมด
  clearHistory() {
    try {
      localStorage.removeItem(this.ROOM_HISTORY_KEY);
      return true;
    } catch (error) {
      console.error('Failed to clear history:', error);
      return false;
    }
  }

  // บันทึกการตั้งค่า
  saveSetting(key, value) {
    try {
      localStorage.setItem(`chacole_${key}`, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Failed to save setting ${key}:`, error);
      return false;
    }
  }

  // ดึงการตั้งค่า
  getSetting(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(`chacole_${key}`);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error(`Failed to get setting ${key}:`, error);
      return defaultValue;
    }
  }
}

export const storageService = new StorageService();

