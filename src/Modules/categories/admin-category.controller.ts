import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { Roles } from 'src/shared/decorators/user-role.decorator';
import { ROLE } from 'generated/prisma/enums';
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { addCategoryDTO } from './dto/addCategory.dto';
import { updateCategoryDTO } from './dto/updateCategory.dto';

@Controller('admin')
export class AdminCategoryController {
  constructor(private categoryService: CategoryService) {}

  // POST ~admin/category/create
  @Post('category/create')
  @Roles(ROLE.ADMIN)
  @UseGuards(AuthRoleGuard)
  @ApiOperation({ summary: 'Create a new category (Admin only)' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  public createCategory(@Body() body: addCategoryDTO) {
    return this.categoryService.createCategory(body);
  }

  // PATCH ~/admin/category/update/:id
  @Patch('category/update/:id')
  @Roles(ROLE.ADMIN)
  @UseGuards(AuthRoleGuard)
  @ApiOperation({ summary: 'Update category (Admin only)' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  public updateCategory(
    @Body() body: updateCategoryDTO,
    @Param('id') id: string,
  ) {
    return this.categoryService.updateCategory(id, body);
  }

  // DELETE ~admin/category/delete/:id
  @Delete('category/delete/:id')
  @Roles(ROLE.ADMIN)
  @UseGuards(AuthRoleGuard)
  @ApiOperation({ summary: 'Delete category (Admin only)' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  public deleteCategory(@Param('id') id: string) {
    return this.categoryService.deleteCategory(id);
  }
}
