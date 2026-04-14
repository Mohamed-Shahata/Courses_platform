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
import { QuizModule } from './modules/quiz/quiz.module';
import { QuestionModule } from './modules/question/question.module';
import { QuizAttemptModule } from './modules/quizAttempt/quizAttempt.module';
import { StudentModule } from './modules/student/student.module';
import { InstructorModule } from './modules/instructor/instructor.module';
import { SectionModule } from './modules/sections/section.module';

@Module({
  imports: [
    UserModule,
    StudentModule,
    InstructorModule,
    DataBaseModule,
    AuthModule,
    MailModule,
    CourseModule,
    EnrollmentModule,
    CategoryModule,
    ReviewModule,
    LessonModule,
    JobModule,
    QuizModule,
    QuestionModule,
    QuizAttemptModule,
    SectionModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}
