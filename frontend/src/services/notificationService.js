// src/services/notificationService.js

class NotificationService {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.initAudioContext();
  }

  initAudioContext() {
    try {
      // สร้าง AudioContext (รองรับทั้ง standard และ webkit)
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  // เล่นเสียง notification (ใช้ Web Audio API สร้างเสียง)
  playNotificationSound() {
    if (!this.enabled || !this.audioContext) return;

    try {
      // Resume audio context (required for some browsers)
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // ตั้งค่าเสียง (โน้ต C6 = 1046.5 Hz)
      oscillator.frequency.value = 1046.5;
      oscillator.type = 'sine';

      // ตั้งค่าความดัง (fade in/out)
      const now = this.audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.15);

      // เล่นเสียง
      oscillator.start(now);
      oscillator.stop(now + 0.15);
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }

  // เล่นเสียง typing (เสียงสั้นกว่า)
  playTypingSound() {
    if (!this.enabled || !this.audioContext) return;

    try {
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      const now = this.audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.1, now + 0.005);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.05);

      oscillator.start(now);
      oscillator.stop(now + 0.05);
    } catch (error) {
      console.warn('Failed to play typing sound:', error);
    }
  }

  // เปิด/ปิดเสียง
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // ตรวจสอบสถานะ
  isEnabled() {
    return this.enabled;
  }

  // Request Push Notification Permission
  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  // Show Push Notification
  showNotification(title, options = {}) {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        ...options
      });
    }
  }
}

export const notificationService = new NotificationService();

