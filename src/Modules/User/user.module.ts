import { Module } from '@nestjs/common';
import { DataBaseModule } from '../DB/database.module';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [UserController],
  providers: [UserService, JwtAuthGuard],
  imports: [DataBaseModule, JwtModule],
})
export class UserModule {}
