import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDTO } from './dto/createCourse.dto';
import { UpdateCourseDTO } from './dto/updateCourse.dto';
import {
  CATEGORY_MESSAGE,
  COURSE_MESSAGE,
  USER_MESSAGES,
} from 'src/shared/constants/messages';
import { InstructorRepository } from '../instructor/instructor.repository';
import { CategoryRepository } from '../categories/category.repository';
import { CourseRepository } from './course.repository';
import { Prisma } from '@prisma/client';

@Injectable()
export class CourseService {
  constructor(
    private courseRepo: CourseRepository,
    private instRepo: InstructorRepository,
    private categoryRepo: CategoryRepository,
  ) {}

  public async createCourse(
    dto: CreateCourseDTO,
    userId: string,
    thumbnail: string,
  ) {
    const {
      title,
      isFree,
      price,
      description,
      language,
      level,
      tags,
      categoryName,
    } = dto;
    const instructor = await this.instRepo.findByUserId(userId);

    if (!instructor)
      throw new NotFoundException(USER_MESSAGES.NOT_FOUND_ACCOUNT);

    const category = await this.categoryRepo.findByName(categoryName);

    if (!category)
      throw new NotFoundException(CATEGORY_MESSAGE.CATEGORY_NOT_FOUND);

    const course = await this.courseRepo.create({
      title,
      description,
      isFree,
      price: isFree ? 0 : price,
      language,
      level,
      thumbnail,
      instructor: {
        connect: { id: instructor.id },
      },
      tags,
      category: {
        connect: {
          name: categoryName,
        },
      },
    });

    return { data: course };
  }

  public async getAllCourses(category?: string, tag?: string) {
    const where: Prisma.CourseWhereInput = {};

    if (category) {
      where.category = {
        name: category,
      };
    }

    if (tag) {
      where.tags = {
        has: tag,
      };
    }

    const courses = await this.courseRepo.findAll(where);

    return courses;
  }

  public async getCourseById(id: string) {
    const course = await this.courseRepo.findById(id);

    if (!course)
      return {
        message: COURSE_MESSAGE.NOT_FOUND_COURSE,
      };
    return { data: course };
  }

  public async getAllCoursesByInst(userId: string) {
    const instructor = await this.instRepo.findByUserId(userId);

    if (!instructor)
      throw new NotFoundException(USER_MESSAGES.NOT_FOUND_ACCOUNT);

    const courses = await this.courseRepo.findByInst(instructor.id);

    return { data: courses };
  }

  public async updateCourse(dto: UpdateCourseDTO, id: string, userId: string) {
    const instructor = await this.instRepo.findByUserId(userId);

    if (!instructor)
      throw new NotFoundException(USER_MESSAGES.NOT_FOUND_ACCOUNT);

    const course = await this.courseRepo.update(id, instructor.id, dto);

    return { data: course };
  }

  public async deleteCourse(id: string, userId: string) {
    const instructor = await this.instRepo.findByUserId(userId);

    if (!instructor)
      throw new NotFoundException(USER_MESSAGES.NOT_FOUND_ACCOUNT);

    await this.courseRepo.delete(id, instructor.id);

    return { message: COURSE_MESSAGE.DELETE_SUCCESSFUL };
  }
}
