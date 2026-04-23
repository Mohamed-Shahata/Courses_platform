import { Module } from '@nestjs/common';
import { InstructorRepository } from './instructor.repository';
import { DataBaseModule } from '../db/database.module';
import { InstructorService } from './instructor.service';
import { InstructorController } from './instructor.controller';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [InstructorController],
  providers: [InstructorRepository, InstructorService],
  imports: [DataBaseModule, UserModule, JwtModule],
  exports: [InstructorRepository],
})
export class InstructorModule {}
