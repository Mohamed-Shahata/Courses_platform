import { Module } from '@nestjs/common';
import { InstructorRepository } from './instructor.repository';
import { DataBaseModule } from '../db/database.module';

@Module({
  providers: [InstructorRepository],
  imports: [DataBaseModule],
  exports: [InstructorRepository],
})
export class InstructorModule {}
