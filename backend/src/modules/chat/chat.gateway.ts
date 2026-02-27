import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

interface VideoUser {
  id: string;
  name: string;
  socketId: string;
}

/**
 * ChatGateway — Single Responsibility: real-time WebSocket events only.
 * All business logic (persistence, auth) stays in the respective services.
 */
@WebSocketGateway({
  cors: {
    origin: (() => {
      const origins = (process.env.CORS_ORIGINS ?? '')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);
      return origins.length ? origins : true;
    })(),
    credentials: true,
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ChatGateway.name);

  /** Map<socketId, VideoUser> tracks users in the video lobby */
  private readonly videoUsers = new Map<string, VideoUser>();

  afterInit() {
    this.logger.log('WebSocket gateway initialised');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    // ── Chat disconnect ──────────────────────────────────────────
    const chatUser = (client as any).chatUser as { name: string } | undefined;
    if (chatUser) {
      this.server.emit('user-left', {
        name: chatUser.name,
        message: `${chatUser.name} left the chat`,
      });
      this.logger.log(`${chatUser.name} disconnected from chat`);
    }

    // ── Video disconnect ─────────────────────────────────────────
    const videoUser = this.videoUsers.get(client.id);
    if (videoUser) {
      this.videoUsers.delete(client.id);
      this.server.emit('user-left-video', { userId: videoUser.id });
      this.emitOnlineUsers();
    }
  }

  // ─── Chat Events ──────────────────────────────────────────────────────────

  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() data: { name: string },
    @ConnectedSocket() client: Socket,
  ) {
    (client as any).chatUser = { name: data.name };
    this.server.emit('user-joined', {
      name: data.name,
      message: `${data.name} joined the chat`,
    });
  }

  @SubscribeMessage('send-message')
  handleMessage(@MessageBody() data: { userId: string; userName: string; message: string }) {
    const messageData = {
      id: Date.now(),
      userId: data.userId,
      userName: data.userName,
      message: data.message,
      timestamp: new Date().toISOString(),
    };
    this.server.emit('receive-message', messageData);
  }

  @SubscribeMessage('typing')
  handleTyping(@MessageBody() data: { userName: string; isTyping: boolean }, @ConnectedSocket() client: Socket) {
    client.broadcast.emit('user-typing', {
      userName: data.userName,
      isTyping: data.isTyping,
    });
  }

  // ─── Video Call Events ────────────────────────────────────────────────────

  @SubscribeMessage('video-join')
  handleVideoJoin(
    @MessageBody() data: { id: string; name: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.videoUsers.set(client.id, { id: data.id, name: data.name, socketId: client.id });
    this.emitOnlineUsers();
  }

  @SubscribeMessage('video-offer')
  handleVideoOffer(
    @MessageBody() payload: { to: string; offer: RTCSessionDescriptionInit },
    @ConnectedSocket() client: Socket,
  ) {
    const target = this.findVideoUserById(payload.to);
    if (target) {
      const sender = this.videoUsers.get(client.id);
      this.server.to(target.socketId).emit('video-offer', {
        from: sender?.id,
        fromName: sender?.name,
        offer: payload.offer,
      });
    }
  }

  @SubscribeMessage('video-answer')
  handleVideoAnswer(
    @MessageBody() payload: { to: string; answer: RTCSessionDescriptionInit },
    @ConnectedSocket() client: Socket,
  ) {
    const target = this.findVideoUserById(payload.to);
    if (target) {
      const sender = this.videoUsers.get(client.id);
      this.server.to(target.socketId).emit('video-answer', {
        from: sender?.id,
        answer: payload.answer,
      });
    }
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @MessageBody() payload: { to: string; candidate: RTCIceCandidateInit },
    @ConnectedSocket() client: Socket,
  ) {
    const target = this.findVideoUserById(payload.to);
    if (target) {
      const sender = this.videoUsers.get(client.id);
      this.server.to(target.socketId).emit('ice-candidate', {
        from: sender?.id,
        candidate: payload.candidate,
      });
    }
  }

  @SubscribeMessage('leave-video')
  handleLeaveVideo(@ConnectedSocket() client: Socket) {
    const user = this.videoUsers.get(client.id);
    if (user) {
      this.videoUsers.delete(client.id);
      this.server.emit('user-left-video', { userId: user.id });
      this.emitOnlineUsers();
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private emitOnlineUsers() {
    const userList = Array.from(this.videoUsers.values()).map(({ id, name }) => ({ id, name }));
    this.server.emit('online-users', userList);
  }

  private findVideoUserById(userId: string): VideoUser | undefined {
    return Array.from(this.videoUsers.values()).find((u) => u.id === userId);
  }
}
