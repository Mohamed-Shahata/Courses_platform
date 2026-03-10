import { Module } from '@nestjs/common';
import { DataBaseModule } from '../DB/database.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailModule } from '../Mail/mail.module';

@Module({
  imports: [DataBaseModule, MailModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
