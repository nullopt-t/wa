import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',  // Configure this for production
    credentials: true,
  },
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Extract token from handshake auth
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn('Connection attempt without token');
        client.emit('error', { message: 'Authentication required' });
        client.disconnect();
        return;
      }

      // Verify token
      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub || payload.userId;

      if (!userId) {
        client.emit('error', { message: 'Invalid token' });
        client.disconnect();
        return;
      }

      // Store user connection
      this.connectedUsers.set(userId, client.id);
      client.data.userId = userId;

      this.logger.log(`User ${userId} connected (Socket: ${client.id})`);

      // Send welcome event
      client.emit('connected', {
        message: 'Connected to chat server',
        userId,
      });
    } catch (error) {
      this.logger.error('Connection error:', error);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.connectedUsers.delete(userId);
      this.logger.log(`User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { sessionId: string; content: string; analyzeEmotions?: boolean },
  ) {
    try {
      const userId = client.data.userId;

      if (!userId || !payload.sessionId || !payload.content) {
        client.emit('error', { message: 'Invalid message data' });
        return;
      }

      // Send typing indicator
      client.emit('bot_typing', { isTyping: true });

      // Process message with AI
      const result = await this.chatService.sendMessage(
        userId,
        payload.sessionId,
        {
          role: 'user',
          content: payload.content,
          analyzeEmotions: payload.analyzeEmotions !== false,
        },
      );

      // Send bot response
      if (result.botMessage) {
        const botMessage: any = result.botMessage;
        client.emit('bot_response', {
          message: {
            id: botMessage._id,
            text: botMessage.content,
            sender: 'bot',
            timestamp: botMessage.createdAt,
            emotions: result.analysis?.emotions,
            suggestions: result.analysis?.suggestions,
            relatedResources: botMessage.relatedResources || [],
            reportData: botMessage.reportData || null,
            messageType: botMessage.messageType || 'text',
            crisisDetected: result.analysis?.crisisDetected,
          },
          analysis: result.analysis,
        });
      }

      // Send error if AI failed
      if (result.error) {
        client.emit('error', {
          message: result.error,
          type: 'ai_error',
        });
      }

      // Stop typing indicator
      client.emit('bot_typing', { isTyping: false });
    } catch (error) {
      this.logger.error('Message handling error:', error);
      client.emit('error', {
        message: 'فشل معالجة الرسالة. يرجى المحاولة مرة أخرى.',
      });
      client.emit('bot_typing', { isTyping: false });
    }
  }

  @SubscribeMessage('start_typing')
  handleUserTyping(@ConnectedSocket() client: Socket, @MessageBody() payload: { sessionId: string }) {
    // Broadcast to other users in the session (if group chat in future)
    client.broadcast.to(payload.sessionId).emit('user_typing', {
      userId: client.data.userId,
      sessionId: payload.sessionId,
    });
  }

  @SubscribeMessage('join_session')
  handleJoinSession(@ConnectedSocket() client: Socket, @MessageBody() payload: { sessionId: string }) {
    client.join(payload.sessionId);
    this.logger.log(`User ${client.data.userId} joined session ${payload.sessionId}`);
  }

  @SubscribeMessage('leave_session')
  handleLeaveSession(@ConnectedSocket() client: Socket, @MessageBody() payload: { sessionId: string }) {
    client.leave(payload.sessionId);
    this.logger.log(`User ${client.data.userId} left session ${payload.sessionId}`);
  }

  // Send message to specific user (for notifications)
  sendToUser(userId: string, event: string, data: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }

  // Broadcast to all connected users
  broadcastToAll(event: string, data: any) {
    this.server.emit(event, data);
  }
}
