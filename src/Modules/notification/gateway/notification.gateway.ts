import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

/**
 * WebSocket Gateway that handles real-time notification delivery.
 *
 * Connection flow:
 *  1. Client connects with a valid JWT in the handshake auth header:
 *       socket = io(URL, { auth: { token: 'Bearer <jwt>' } })
 *  2. Gateway verifies the token, extracts the userId.
 *  3. The socket is joined to a private room: `user:<userId>`.
 *  4. All notification events are emitted to that room — so multi-tab / multi-device is supported automatically.
 *
 * Events emitted to client:
 *  - `notification:new`        → payload: Notification object
 *  - `notification:unread-count` → payload: { count: number }
 *
 * Events the client can send:
 *  - `notification:ping`       → server responds with `notification:pong` (health check)
 */
@WebSocketGateway({
  namespace: 'notifications',
  cors: {
    origin: '*', // Tighten this to your frontend URL in production
    credentials: true,
  },
})
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: Server;

  private readonly logger = new Logger(NotificationGateway.name);

  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  afterInit() {
    this.logger.log('🔔 NotificationGateway initialized');
  }

  // ==================== Connection Lifecycle ====================

  async handleConnection(client: Socket) {
    try {
      const userId = this._extractAndVerifyToken(client);

      // Store userId on the socket for later use
      client.data.userId = userId;

      // Join a private room so we can target this user specifically
      await client.join(this._room(userId));

      this.logger.log(`Client connected: ${client.id} → user:${userId}`);
    } catch (err) {
      this.logger.warn(`Unauthorized connection attempt: ${client.id}`);
      client.emit('error', {
        message: 'Unauthorized: invalid or missing token',
      });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data?.userId ?? 'unknown';
    this.logger.log(`Client disconnected: ${client.id} → user:${userId}`);
  }

  // ==================== Incoming Client Events ====================

  @SubscribeMessage('notification:ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('notification:pong', { timestamp: new Date().toISOString() });
  }

  // ==================== Outgoing Server Emitters ====================

  /**
   * Send a new notification to a specific user's room.
   * Called by NotificationService after every notification is created.
   *
   * @param userId   - Target user's ID.
   * @param payload  - The full notification object.
   */
  sendToUser(userId: string, payload: unknown) {
    this.server.to(this._room(userId)).emit('notification:new', payload);
  }

  /**
   * Send an updated unread count to a specific user's room.
   * Called after mark-as-read / delete operations.
   *
   * @param userId - Target user's ID.
   * @param count  - Current unread notification count.
   */
  sendUnreadCount(userId: string, count: number) {
    this.server
      .to(this._room(userId))
      .emit('notification:unread-count', { count });
  }

  /**
   * Broadcast a system notification to ALL connected users.
   * Called by admin "Send System Notification" feature.
   *
   * @param payload - The notification payload to broadcast.
   */
  broadcastToAll(payload: unknown) {
    this.server.emit('notification:new', payload);
  }

  // ==================== Private Helpers ====================

  private _room(userId: string): string {
    return `user:${userId}`;
  }

  private _extractAndVerifyToken(client: Socket): string {
    // Supports: { auth: { token: "Bearer <jwt>" } }
    const raw: string =
      client.handshake?.auth?.token ||
      client.handshake?.headers?.authorization ||
      '';

    const token = raw.startsWith('Bearer ') ? raw.slice(7) : raw;

    if (!token) throw new WsException('Missing token');

    const payload = this.jwtService.verify(token, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET'),
    });

    if (!payload?.sub) throw new WsException('Invalid token payload');

    return payload.sub as string;
  }
}
