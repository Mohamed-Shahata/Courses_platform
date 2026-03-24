import { Module } from '@nestjs/common';
import { QuizAttemptService } from './quizAttempt.service';
import { QuizAttemptController } from './quizAttempt.controller';
import { DataBaseModule } from '../db/database.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';

@Module({
  providers: [QuizAttemptService],
  controllers: [QuizAttemptController],
  imports: [DataBaseModule, JwtModule, UserModule],
})
export class QuizAttemptModule {}
