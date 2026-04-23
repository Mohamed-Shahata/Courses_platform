import { Module } from '@nestjs/common';
import { QuizAttemptService } from './quizAttempt.service';
import { QuizAttemptController } from './quizAttempt.controller';
import { DataBaseModule } from '../db/database.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { QuizAttemptRepository } from './quizAttempt.repository';
import { QuizModule } from '../quiz/quiz.module';
import { QuestionModule } from '../question/question.module';
import { LessonModule } from '../lessons/lesson.module';

@Module({
  providers: [QuizAttemptService, QuizAttemptRepository],
  controllers: [QuizAttemptController],
  imports: [
    DataBaseModule,
    JwtModule,
    UserModule,
    QuizModule,
    QuestionModule,
    LessonModule,
  ],
})
export class QuizAttemptModule {}
