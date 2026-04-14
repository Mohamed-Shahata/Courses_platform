import { Module } from '@nestjs/common';
import { StudentRepository } from './student.repository';
import { DataBaseModule } from '../db/database.module';

@Module({
  providers: [StudentRepository],
  imports: [DataBaseModule],
  exports: [StudentRepository],
})
export class StudentModule {}
