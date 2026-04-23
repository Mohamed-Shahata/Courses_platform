import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { DataBaseModule } from '../db/database.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { AdminCategoryController } from './admin-category.controller';
import { CategoryRepository } from './category.repository';

@Module({
  providers: [CategoryService, CategoryRepository],
  controllers: [CategoryController, AdminCategoryController],
  imports: [DataBaseModule, JwtModule, UserModule],
  exports: [CategoryRepository],
})
export class CategoryModule {}
