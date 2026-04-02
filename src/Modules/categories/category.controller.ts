import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Category')
@ApiBearerAuth('access-token')
@Controller('categories')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  // GET ~/category/all
  @Get('all')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'Returns list of all categories' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public getAllCategory() {
    return this.categoryService.getAllCategory();
  }

  // GET ~/category/:id
  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Returns category details' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public getCategory(@Param('id') id: string) {
    return this.categoryService.getCategoryById(id);
  }
}
