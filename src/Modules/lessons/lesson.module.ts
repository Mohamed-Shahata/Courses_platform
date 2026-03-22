import { Module } from '@nestjs/common';
import { DataBaseModule } from '../db/database.module';
import { JwtModule } from '@nestjs/jwt';
import { LessonService } from './lesson.service';
import { LessonController } from './lesson.controller';
import { UserModule } from '../user/user.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Module({
  imports: [
    DataBaseModule,
    JwtModule,
    UserModule,
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
  providers: [LessonService],
  controllers: [LessonController],
})
export class LessonModule {}
