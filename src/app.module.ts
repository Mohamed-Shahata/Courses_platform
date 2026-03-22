import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DataBaseModule } from './modules/db/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { MailModule } from './shared/mail/mail.module';
import { UserModule } from './modules/user/user.module';
import { CourseModule } from './modules/course/course.module';
import { EnrollmentModule } from './modules/enrollment/enrollment.module';
import { CategoryModule } from './modules/categories/category.module';
import { ReviewModule } from './modules/reviews/review.module';
import { LessonModule } from './modules/lessons/lesson.module';
import { ScheduleModule } from '@nestjs/schedule';
import { JobModule } from './jobs/job.module';

@Module({
  imports: [
    UserModule,
    DataBaseModule,
    AuthModule,
    MailModule,
    CourseModule,
    EnrollmentModule,
    CategoryModule,
    ReviewModule,
    LessonModule,
    JobModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}
