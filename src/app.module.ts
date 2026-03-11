import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DataBaseModule } from './Modules/DB/database.module';
import { AuthModule } from './Modules/Auth/auth.module';
import { MailModule } from './shared/mail/mail.module';

@Module({
  imports: [
    DataBaseModule,
    AuthModule,
    MailModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class AppModule { }
