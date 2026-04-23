import { Module } from '@nestjs/common';
import { StudentRepository } from './student.repository';
import { DataBaseModule } from '../db/database.module';
import { UserModule } from '../user/user.module';
import { StudentController } from './student.controller';
import { JwtModule } from '@nestjs/jwt';
import { StudentService } from './student.service';

@Module({
  controllers: [StudentController],
  providers: [StudentRepository, StudentService],
  imports: [DataBaseModule, UserModule, JwtModule],
  exports: [StudentRepository],
})
export class StudentModule {}
