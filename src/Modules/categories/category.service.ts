import { BadRequestException, Injectable } from '@nestjs/common';
import { DataBaseService } from '../db/database.service';
import { addCategoryDTO } from './dto/addCategory.dto';
import { CATEGORY_MESSAGE } from 'src/shared/constants/messages';
import { updateCategoryDTO } from './dto/updateCategory.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: DataBaseService) {}

  public async createCategory(dto: addCategoryDTO) {
    const { name } = dto;

    const category = await this.prisma.category.findUnique({
      where: { name },
    });

    if (category)
      throw new BadRequestException(CATEGORY_MESSAGE.CATEGORY_ALREADY_IN_DB);

    const Ncategory = await this.prisma.category.create({
      data: { name },
    });

    return { data: Ncategory };
  }

  public async getAllCategory() {
    const allCategory = await this.prisma.category.findMany();

    return { data: allCategory };
  }

  public async getCategoryById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category)
      throw new BadRequestException(CATEGORY_MESSAGE.CATEGORY_NOT_FOUND);

    return { data: category };
  }

  public async updateCategory(id: string, dto: updateCategoryDTO) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category)
      throw new BadRequestException(CATEGORY_MESSAGE.CATEGORY_NOT_FOUND);

    const nCategory = await this.prisma.category.update({
      where: { id },
      data: dto,
    });

    return { data: nCategory };
  }

  public async deleteCategory(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category)
      throw new BadRequestException(CATEGORY_MESSAGE.CATEGORY_NOT_FOUND);

    await this.prisma.category.delete({ where: { id } });

    return { message: CATEGORY_MESSAGE.CATEGORY_DELETE_SUCCESSFUL };
  }
}
