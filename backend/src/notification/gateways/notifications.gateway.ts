import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { AuthGuard } from '@nestjs/passport';

@WebSocketGateway({
  cors: {
    origin: '*', // Configure this for production
  },
  namespace: 'notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private userSockets: Map<string, string[]> = new Map(); // userId -> [socketIds]

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
    // Remove socket from user's sockets
    const userId = client.handshake.auth.userId;
    if (userId) {
      const sockets = this.userSockets.get(userId) || [];
      const filtered = sockets.filter(id => id !== client.id);
      if (filtered.length > 0) {
        this.userSockets.set(userId, filtered);
      } else {
        this.userSockets.delete(userId);
      }
    }
  }

  @SubscribeMessage('authenticate')
  handleAuthentication(
    @ConnectedSocket() client: Socket,
    payload: { userId: string },
  ) {
    // Try payload first, fallback to handshake auth (from socket.io auth option)
    const userId = payload?.userId || client.handshake.auth?.userId;
    
    if (!userId) {
      this.logger.warn(`Authentication failed: missing userId on socket ${client.id}`);
      return { success: false, error: 'Missing userId' };
    }

    this.logger.debug(`User ${userId} authenticated on socket ${client.id}`);

    // Store socket ID for this user
    const sockets = this.userSockets.get(userId) || [];
    sockets.push(client.id);
    this.userSockets.set(userId, sockets);

    // Join user's personal room
    client.join(`user:${userId}`);

    return { success: true };
  }

  /**
   * Send notification to specific user
   */
  sendToUser(userId: string, event: string, data: any) {
    this.logger.debug(`Sending ${event} to user ${userId}`);
    this.server.to(`user:${userId}`).emit(event, data);
  }

  /**
   * Broadcast to all users
   */
  broadcast(event: string, data: any) {
    this.logger.debug(`Broadcasting ${event} to all users`);
    this.server.emit(event, data);
  }

  /**
   * Send new notification
   */
  sendNewNotification(userId: string, notification: any) {
    this.sendToUser(userId, 'new_notification', notification);
  }

  /**
   * Send notification updated (marked as read, etc.)
   */
  sendNotificationUpdated(userId: string, notificationId: string) {
    this.sendToUser(userId, 'notification_updated', { notificationId });
  }
}
