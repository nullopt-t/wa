import { io } from 'socket.io-client';
import { API_URL } from '../config.js';

class NotificationSocket {
  constructor() {
    this.socket = null;
    this.userId = null;
  }

  /**
   * Connect to notification socket
   */
  connect(userId) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    this.userId = userId;
    
    this.socket = io(`${API_URL}/notifications`, {
      auth: { userId },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('Notification socket connected:', this.socket.id);
      
      // Authenticate
      this.socket.emit('authenticate', { userId });
    });

    this.socket.on('disconnect', () => {
      console.log('Notification socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.warn('Notification socket connection error (this is optional):', error.message);
      // Don't log as error - notifications are optional feature
    });

    return this.socket;
  }

  /**
   * Listen for new notifications
   */
  onNewNotification(callback) {
    if (!this.socket) return;
    
    this.socket.on('new_notification', (notification) => {
      console.log('New notification received:', notification);
      callback(notification);
    });
  }

  /**
   * Listen for notification updates
   */
  onNotificationUpdated(callback) {
    if (!this.socket) return;
    
    this.socket.on('notification_updated', (data) => {
      console.log('Notification updated:', data);
      callback(data);
    });
  }

  /**
   * Disconnect socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
    }
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.socket?.connected;
  }
}

// Singleton instance
export const notificationSocket = new NotificationSocket();
