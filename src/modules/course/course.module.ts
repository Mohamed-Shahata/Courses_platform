import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { DataBaseModule } from '../db/database.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';

@Module({
  providers: [CourseService],
  controllers: [CourseController],
  imports: [DataBaseModule, JwtModule, UserModule],
})
export class CourseModule {}
