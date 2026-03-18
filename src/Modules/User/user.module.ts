import { Module } from '@nestjs/common';
import { DataBaseModule } from '../DB/database.module';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard';

@Module({
  controllers: [UserController],
  providers: [UserService, JwtAuthGuard, AuthRoleGuard],
  imports: [DataBaseModule, JwtModule],
  exports: [UserService],
})
export class UserModule {}
