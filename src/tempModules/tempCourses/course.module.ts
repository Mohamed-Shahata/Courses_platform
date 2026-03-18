import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { DataBaseModule } from '../DB/database.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../User/user.module';

@Module({
  providers: [CourseService],
  controllers: [CourseController],
  imports: [DataBaseModule, JwtModule, UserModule],
})
export class CourseModule {}
