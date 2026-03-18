import { Module } from '@nestjs/common';
import { EnrollmentController } from './enrollment.controller';
import { EnrollmentService } from './enrollment.service';
import { DataBaseModule } from '../DB/database.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../User/user.module';

@Module({
  controllers: [EnrollmentController],
  providers: [EnrollmentService],
  imports: [DataBaseModule, JwtModule, UserModule],
})
export class EnrollmentModule {}
