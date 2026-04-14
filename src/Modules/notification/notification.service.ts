import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { NOTIFICATION_MESSAGES } from '../../shared/constants/messages';
import { CreateNotificationDTO } from './dto/create-notification.dto';
import { NotificationRepository } from './notification.repository';
import { NotificationGateway } from './gateway/notification.gateway';
import { ICreateNotification } from './types/notification.types';

/**
 * Service responsible for all notification business logic.
 *
 * Handles creating, reading, and deleting notifications.
 * Emits real-time events via NotificationGateway after every write operation.
 *
 * @injectable
 */
@Injectable()
export class NotificationService {
  constructor(
    private notificationRepo: NotificationRepository,
    private notificationGateway: NotificationGateway,
  ) {}

  // ==================== Read ====================

  /**
   * Retrieves all notifications for the currently authenticated user.
   * Ordered newest-first.
   *
   * @param userId - The ID of the requesting user.
   * @returns An object containing the notifications array.
   */
  public async getAllNotifications(userId: string) {
    const notifications = await this.notificationRepo.findAllByUser(userId);
    return { data: notifications };
  }

  /**
   * Returns the count of unread notifications for the authenticated user.
   * Useful for badge counters in the UI.
   *
   * @param userId - The ID of the requesting user.
   * @returns An object containing the unread count.
   */
  public async getUnreadCount(userId: string) {
    const count = await this.notificationRepo.countUnread(userId);
    return { data: { unreadCount: count } };
  }

  // ==================== Write (internal / admin) ====================

  /**
   * Creates a single notification and immediately pushes it
   * to the target user's WebSocket room in real-time.
   *
   * Can be called internally by other services (e.g., EnrollmentService,
   * PaymentService) or by an admin via the POST endpoint.
   *
   * @param dto - The notification payload.
   * @returns An object containing the created notification record.
   */
  public async createNotification(dto: CreateNotificationDTO) {
    const notification = await this.notificationRepo.create(dto);

    // Push real-time event to the user's socket room
    this.notificationGateway.sendToUser(dto.userId, notification);

    return { data: notification };
  }

  /**
   * Internal helper — called by other services (not exposed via HTTP).
   * Creates a notification without returning an HTTP response shape.
   *
   * @param data - Raw notification data.
   */
  public async notify(data: ICreateNotification): Promise<void> {
    const notification = await this.notificationRepo.create(data);
    this.notificationGateway.sendToUser(data.userId, notification);
  }

  // ==================== Mark as Read ====================

  /**
   * Marks a specific notification as read.
   *
   * Validates ownership — a user can only mark their own notifications.
   *
   * @param id - The notification ID.
   * @param userId - The ID of the requesting user.
   * @returns An object containing the updated notification.
   * @throws {BadRequestException} If the notification is not found.
   * @throws {ForbiddenException} If the user doesn't own the notification.
   */
  public async markAsRead(id: string, userId: string) {
    const notification = await this.notificationRepo.findById(id);

    if (!notification)
      throw new BadRequestException(NOTIFICATION_MESSAGES.NOT_FOUND);

    if (notification.userId !== userId)
      throw new ForbiddenException(NOTIFICATION_MESSAGES.FORBIDDEN);

    const updated = await this.notificationRepo.markAsRead(id);

    // Push updated unread count in real-time
    await this._emitUnreadCount(userId);

    return { data: updated };
  }

  /**
   * Marks ALL unread notifications for the authenticated user as read.
   *
   * @param userId - The ID of the requesting user.
   * @returns A success message and the count of updated notifications.
   */
  public async markAllAsRead(userId: string) {
    const result = await this.notificationRepo.markAllAsRead(userId);

    // Push updated unread count in real-time
    await this._emitUnreadCount(userId);

    return {
      message: NOTIFICATION_MESSAGES.ALL_MARKED_READ,
      data: { updatedCount: result.count },
    };
  }

  // ==================== Delete ====================

  /**
   * Permanently deletes a specific notification.
   *
   * Validates ownership — a user can only delete their own notifications.
   *
   * @param id - The notification ID.
   * @param userId - The ID of the requesting user.
   * @returns A success message.
   * @throws {BadRequestException} If the notification is not found.
   * @throws {ForbiddenException} If the user doesn't own the notification.
   */
  public async deleteNotification(id: string, userId: string) {
    const notification = await this.notificationRepo.findById(id);

    if (!notification)
      throw new BadRequestException(NOTIFICATION_MESSAGES.NOT_FOUND);

    if (notification.userId !== userId)
      throw new ForbiddenException(NOTIFICATION_MESSAGES.FORBIDDEN);

    await this.notificationRepo.deleteById(id);

    // Push updated unread count in real-time
    await this._emitUnreadCount(userId);

    return { message: NOTIFICATION_MESSAGES.DELETED };
  }

  // ==================== Private Helpers ====================

  /**
   * Fetches the latest unread count and emits it to the user's socket room.
   * Called after every write operation to keep the client in sync.
   */
  private async _emitUnreadCount(userId: string): Promise<void> {
    const count = await this.notificationRepo.countUnread(userId);
    this.notificationGateway.sendUnreadCount(userId, count);
  }
}
