import { Module } from '@nestjs/common';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { DataBaseModule } from '../db/database.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';

@Module({
  providers: [QuestionService],
  controllers: [QuestionController],
  imports: [DataBaseModule, JwtModule, UserModule],
})
export class QuestionModule {}
