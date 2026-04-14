import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DataBaseModule } from '../db/database.module';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationRepository } from './notification.repository';
import { NotificationGateway } from './gateway/notification.gateway';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { AuthRoleGuard } from '../../shared/guards/auth-role.guard';
import { UserModule } from '../user/user.module';

@Module({
  imports: [DataBaseModule, JwtModule, UserModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationRepository,
    NotificationGateway,
    JwtAuthGuard,
    AuthRoleGuard,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
