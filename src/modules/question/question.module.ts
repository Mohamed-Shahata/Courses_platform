import { Module } from '@nestjs/common';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { DataBaseModule } from '../db/database.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { QuestionRepository } from './question.repository';
import { QuizModule } from '../quiz/quiz.module';

@Module({
  providers: [QuestionService, QuestionRepository],
  controllers: [QuestionController],
  imports: [DataBaseModule, JwtModule, UserModule, QuizModule],
  exports: [QuestionRepository],
})
export class QuestionModule {}
