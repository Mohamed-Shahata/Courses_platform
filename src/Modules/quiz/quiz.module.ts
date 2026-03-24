import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { DataBaseModule } from '../db/database.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';

@Module({
  providers: [QuizService],
  controllers: [QuizController],
  imports: [DataBaseModule, JwtModule, UserModule],
})
export class QuizModule {}
