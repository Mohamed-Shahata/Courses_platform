import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { addCategoryDTO } from './dto/addCategory.dto';
import { Roles } from 'src/shared/decorators/user-role.decorator';
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { updateCategoryDTO } from './dto/updateCategory.dto';
import { ROLE } from 'generated/prisma/enums';
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

  // POST ~/category/create
  @Post('create')
  @Roles(ROLE.ADMIN)
  @UseGuards(AuthRoleGuard)
  @ApiOperation({ summary: 'Create a new category (Admin only)' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  public createCategory(@Body() body: addCategoryDTO) {
    return this.categoryService.createCategory(body);
  }

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

  // PATCH ~/category/update/:id
  @Patch('update/:id')
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

  // DELETE ~/category/delete/:id
  @Delete('delete/:id')
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
