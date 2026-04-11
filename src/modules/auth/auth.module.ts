import { Module } from '@nestjs/common';
import { DataBaseModule } from '../db/database.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailModule } from '../../shared/mail/mail.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { StringValue } from 'ms';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { UserModule } from '../user/user.module';
import { UserTokenRepository } from './userToken.repository';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          global: true,
          secret: config.get<string>('JWT_ACCESS_SECRET'),
          signOptions: {
            expiresIn: config.get<string>(
              'JWT_ACCESS_EXPIRES_IN',
            ) as StringValue,
          },
        };
      },
    }),
    DataBaseModule,
    MailModule,
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, UserTokenRepository],
})
export class AuthModule {}
