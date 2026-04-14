import { Module } from '@nestjs/common';
import { DataBaseModule } from '../db/database.module';
import { JwtModule } from '@nestjs/jwt';
import { LessonService } from './lesson.service';
import { LessonController } from './lesson.controller';
import { UserModule } from '../user/user.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { LessonRepository } from './lesson.repository';
import { LessonProgressRepository } from './lessonProgress.repository';
import { SectionModule } from '../sections/section.module';

@Module({
  imports: [
    DataBaseModule,
    JwtModule,
    UserModule,
    SectionModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/video',
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
  providers: [LessonService, LessonRepository, LessonProgressRepository],
  controllers: [LessonController],
  exports: [LessonRepository, LessonProgressRepository],
})
export class LessonModule {}
