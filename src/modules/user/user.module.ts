import { Module } from '@nestjs/common';
import { DataBaseModule } from '../db/database.module';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AdminUserController } from './admin-user.controller';
import { CloudinaryModule } from 'src/shared/cloudinary/cloudinary.module';

@Module({
  controllers: [UserController, AdminUserController],
  providers: [UserService, JwtAuthGuard, AuthRoleGuard],
  imports: [
    DataBaseModule,
    JwtModule,
    CloudinaryModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/profilesImage',
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
  exports: [UserService],
})
export class UserModule {}
