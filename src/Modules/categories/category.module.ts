import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { DataBaseModule } from '../db/database.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';

@Module({
  providers: [CategoryService],
  controllers: [CategoryController],
  imports: [DataBaseModule, JwtModule, UserModule],
})
export class CategoryModule {}
