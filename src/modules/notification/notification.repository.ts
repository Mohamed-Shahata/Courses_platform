import { Injectable } from '@nestjs/common';
import { DataBaseService } from '../db/database.service';
import { ICreateNotification } from './types/notification.types';

/**
 * Repository responsible for all direct database operations on the Notification model.
 *
 * No business logic here — only Prisma calls.
 */
@Injectable()
export class NotificationRepository {
  constructor(private prisma: DataBaseService) {}

  // ==================== Queries ====================

  /**
   * Fetch all notifications for a user, newest first.
   */
  findAllByUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Count unread notifications for a user.
   */
  countUnread(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  /**
   * Find a single notification by its ID.
   */
  findById(id: string) {
    return this.prisma.notification.findUnique({ where: { id } });
  }

  // ==================== Mutations ====================

  /**
   * Create a single notification record.
   */
  create(data: ICreateNotification) {
    return this.prisma.notification.create({ data });
  }

  /**
   * Mark a single notification as read and record the timestamp.
   */
  markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  /**
   * Mark ALL unread notifications for a user as read in one query.
   * Returns the count of updated records.
   */
  markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  /**
   * Hard-delete a single notification by its ID.
   */
  deleteById(id: string) {
    return this.prisma.notification.delete({ where: { id } });
  }
}
