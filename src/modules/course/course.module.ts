import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { DataBaseModule } from '../db/database.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { InstructorModule } from '../instructor/instructor.module';
import { CategoryModule } from '../categories/category.module';
import { LessonModule } from '../lessons/lesson.module';
import { CourseRepository } from './course.repository';
@Module({
  providers: [CourseService, CourseRepository],
  controllers: [CourseController],
  imports: [
    DataBaseModule,
    JwtModule,
    UserModule,
    InstructorModule,
    CategoryModule,
    LessonModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/image',
        filename: (req, file, cb) => {
          const prefix = `${Date.now()}-${Math.round(Math.random() * 1000000)}`;
          const filename = `${prefix}-${file.originalname}`;
          cb(null, filename);
        },
      }),
      limits: {
        fileSize: 50 * 1024 * 1024,
      },
    }),
  ],
  exports: [CourseRepository],
})
export class CourseModule {}
