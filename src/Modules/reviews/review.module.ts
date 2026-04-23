import { Module } from '@nestjs/common';
import { DataBaseModule } from '../db/database.module';
import { ReviewServices } from './review.service';
import { ReviewController } from './review.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';

@Module({
  imports: [DataBaseModule, JwtModule, UserModule],
  providers: [ReviewServices],
  controllers: [ReviewController],
})
export class ReviewModule {}
