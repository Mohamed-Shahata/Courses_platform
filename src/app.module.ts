import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DataBaseModule } from './modules/db/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { MailModule } from './shared/mail/mail.module';
import { UserModule } from './modules/user/user.module';
import { CourseModule } from './modules/course/course.module';
import { EnrollmentModule } from './modules/enrollment/enrollment.module';

@Module({
  imports: [
    UserModule,
    DataBaseModule,
    AuthModule,
    MailModule,
    CourseModule,
    EnrollmentModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
