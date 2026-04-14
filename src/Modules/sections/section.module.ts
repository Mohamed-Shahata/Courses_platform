import { forwardRef, Module } from '@nestjs/common';
import { SectionRepository } from './section.repository';
import { SectionService } from './section.service';
import { CourseModule } from '../course/course.module';
import { DataBaseModule } from '../db/database.module';
import { SectionController } from './section.controller';
import { LessonModule } from '../lessons/lesson.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';

@Module({
  providers: [SectionRepository, SectionService],
  controllers: [SectionController],
  imports: [
    JwtModule,
    UserModule,
    forwardRef(() => CourseModule),
    DataBaseModule,
    forwardRef(() => LessonModule),
  ],
  exports: [SectionRepository],
})
export class SectionModule {}
