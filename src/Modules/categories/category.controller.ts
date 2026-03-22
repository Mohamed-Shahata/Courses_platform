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

@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  // Post ~/category/create
  @Post('create')
  @Roles(ROLE.ADMIN)
  @UseGuards(AuthRoleGuard)
  public createCategory(@Body() body: addCategoryDTO) {
    return this.categoryService.createCategory(body);
  }

  // Get ~/category/all
  @Get('all')
  @UseGuards(JwtAuthGuard)
  public getAllCategory() {
    return this.categoryService.getAllCategory();
  }

  //Get ~/category/:id
  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  public getCategory(@Param('id') id: string) {
    return this.categoryService.getCategoryById(id);
  }

  //Patch ~/category/update/:id
  @Patch('update/:id')
  @Roles(ROLE.ADMIN)
  @UseGuards(AuthRoleGuard)
  public updateCategory(
    @Body() body: updateCategoryDTO,
    @Param('id') id: string,
  ) {
    return this.categoryService.updateCategory(id, body);
  }

  //Get ~/category/delete/:id
  @Delete('delete/:id')
  @Roles(ROLE.ADMIN)
  @UseGuards(AuthRoleGuard)
  public deleteCategory(@Param('id') id: string) {
    return this.categoryService.deleteCategory(id);
  }
}
