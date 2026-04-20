import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { DataBaseModule } from '../db/database.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { QuizRepository } from './quiz.repository';
import { LessonModule } from '../lessons/lesson.module';

@Module({
  providers: [QuizService, QuizRepository],
  controllers: [QuizController],
  imports: [DataBaseModule, JwtModule, UserModule, LessonModule],
  exports: [QuizRepository],
})
export class QuizModule {}
