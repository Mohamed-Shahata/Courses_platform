import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { Roles } from 'src/shared/decorators/user-role.decorator';
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard';
import { ROLE } from '../../../generated/prisma/enums';
import { CreateNotificationDTO } from './dto/create-notification.dto';
import { NotificationService } from './notification.service';

@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@Controller('notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  // ==================== User Endpoints ====================

  // GET ~/notification
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all notifications for the current user' })
  @ApiResponse({ status: 200, description: 'Returns all notifications' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public getAllNotifications(@CurrentUser('id') userId: string) {
    return this.notificationService.getAllNotifications(userId);
  }

  // GET ~/notification/unread-count
  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get the count of unread notifications' })
  @ApiResponse({ status: 200, description: 'Returns unread count' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public getUnreadCount(@CurrentUser('id') userId: string) {
    return this.notificationService.getUnreadCount(userId);
  }

  // PATCH ~/notification/read-all
  @Patch('read-all')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public markAllAsRead(@CurrentUser('id') userId: string) {
    return this.notificationService.markAllAsRead(userId);
  }

  // PATCH ~/notification/:id/read
  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mark a specific notification as read' })
  @ApiParam({ name: 'id', description: 'Notification UUID' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  @ApiResponse({ status: 400, description: 'Notification not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - not your notification',
  })
  public markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.notificationService.markAsRead(id, userId);
  }

  // DELETE ~/notification/:id
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a specific notification' })
  @ApiParam({ name: 'id', description: 'Notification UUID' })
  @ApiResponse({ status: 200, description: 'Notification deleted' })
  @ApiResponse({ status: 400, description: 'Notification not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - not your notification',
  })
  public deleteNotification(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.notificationService.deleteNotification(id, userId);
  }

  // ==================== Admin Endpoint ====================

  // POST ~/notification
  @Post()
  @Roles(ROLE.ADMIN)
  @UseGuards(AuthRoleGuard)
  @ApiOperation({
    summary: 'Create a notification for a user (Admin only)',
    description:
      'Used by admins to manually push a notification to any user. ' +
      'Other services (Enrollment, Payment, Quiz) call NotificationService.notify() internally.',
  })
  @ApiResponse({
    status: 201,
    description: 'Notification created and delivered',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  public createNotification(@Body() dto: CreateNotificationDTO) {
    return this.notificationService.createNotification(dto);
  }
}
