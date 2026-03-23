import { BadRequestException, Injectable } from '@nestjs/common';
import { DataBaseService } from '../db/database.service';
import { addCategoryDTO } from './dto/addCategory.dto';
import { CATEGORY_MESSAGE } from 'src/shared/constants/messages';
import { updateCategoryDTO } from './dto/updateCategory.dto';

/**
 * Service responsible for managing course categories.
 *
 * Categories are admin-managed entities used to organize and filter courses.
 * Each category name must be unique across the platform.
 *
 * @injectable
 */
@Injectable()
export class CategoryService {
  constructor(private prisma: DataBaseService) {}

  /**
   * Creates a new course category.
   *
   * @param dto - DTO containing the category `name`.
   * @returns An object containing the newly created category record.
   * @throws {BadRequestException} If a category with the same name already exists.
   */
  public async createCategory(dto: addCategoryDTO) {
    const { name } = dto;

    const category = await this.prisma.category.findUnique({ where: { name } });
    if (category)
      throw new BadRequestException(CATEGORY_MESSAGE.CATEGORY_ALREADY_IN_DB);

    const Ncategory = await this.prisma.category.create({ data: { name } });

    return { data: Ncategory };
  }

  /**
   * Retrieves all available course categories.
   *
   * @returns An object containing an array of all category records.
   */
  public async getAllCategory() {
    const allCategory = await this.prisma.category.findMany();
    return { data: allCategory };
  }

  /**
   * Retrieves a single category by its unique ID.
   *
   * @param id - The unique identifier of the category.
   * @returns An object containing the matching category record.
   * @throws {BadRequestException} If no category is found with the given ID.
   */
  public async getCategoryById(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category)
      throw new BadRequestException(CATEGORY_MESSAGE.CATEGORY_NOT_FOUND);

    return { data: category };
  }

  /**
   * Updates an existing category's details.
   *
   * @param id - The unique identifier of the category to update.
   * @param dto - DTO containing the fields to update.
   * @returns An object containing the updated category record.
   * @throws {BadRequestException} If no category is found with the given ID.
   */
  public async updateCategory(id: string, dto: updateCategoryDTO) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category)
      throw new BadRequestException(CATEGORY_MESSAGE.CATEGORY_NOT_FOUND);

    const nCategory = await this.prisma.category.update({
      where: { id },
      data: dto,
    });

    return { data: nCategory };
  }

  /**
   * Permanently deletes a category from the database.
   *
   * @param id - The unique identifier of the category to delete.
   * @returns A success message confirming deletion.
   * @throws {BadRequestException} If no category is found with the given ID.
   */
  public async deleteCategory(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category)
      throw new BadRequestException(CATEGORY_MESSAGE.CATEGORY_NOT_FOUND);

    await this.prisma.category.delete({ where: { id } });

    return { message: CATEGORY_MESSAGE.CATEGORY_DELETE_SUCCESSFUL };
  }
}