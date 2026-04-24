import { Module } from '@nestjs/common';
import { DataBaseModule } from '../db/database.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailModule } from '../../shared/mail/mail.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { StringValue } from 'ms';
import { UserModule } from '../user/user.module';
import { UserTokenRepository } from './userToken.repository';
import { GoogleStratgy } from './strategies/google.strategy';
import { RefreshTokenStrategy } from './strategies/refreshToken.strategy';
import { StudentModule } from '../student/student.module';
import { InstructorModule } from '../instructor/instructor.module';
import { OutBoxRepository } from './outbox.repository';
import { FacebookStrategy } from './strategies/facebook.strategy';

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
    StudentModule,
    InstructorModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserTokenRepository,
    OutBoxRepository,
    GoogleStratgy,
    RefreshTokenStrategy,
    FacebookStrategy,
  ],
})
export class AuthModule {}
