import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDTO } from './dto/createCourse.dto';
import { UpdateCourseDTO } from './dto/updateCourse.dto';
import { DataBaseService } from '../DB/database.service';
import { COURSE_MESSAGE, USER_MESSAGES } from 'src/shared/constants/messages';

@Injectable()
export class CourseService {
  constructor(private prisma: DataBaseService) {}

  public async createCourse(dto: CreateCourseDTO, instId: string) {
    const instructor = await this.prisma.user.findUnique({
      where: { id: instId },
    });

    if (!instructor)
      throw new NotFoundException(USER_MESSAGES.NOT_FOUND_ACCOUNT);

    const { title, videoURL, isFree, price, description, language, level } =
      dto;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const course = await this.prisma.course.create({
      data: {
        title,
        description,
        videoURL,
        isFree,
        price: isFree ? 0 : price,
        language,
        level,
        instructor: {
          connect: { id: instId },
        },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return { data: course };
  }

  public async getAllCourses() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const courses = await this.prisma.course.findMany();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return courses;
  }
  public async getCourseById(id: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course)
      return {
        message: COURSE_MESSAGE.NOT_FOUND_COURSE,
      };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return { data: course };
  }
  public async getAllCoursesByInst(instId: string) {
    const instructor = await this.prisma.user.findUnique({
      where: { id: instId },
    });

    if (!instructor)
      throw new NotFoundException(USER_MESSAGES.NOT_FOUND_ACCOUNT);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const courses = await this.prisma.course.findMany({
      where: { instructor },
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return { data: courses };
  }

  public async updateCourse(dto: UpdateCourseDTO, id: string, instId: string) {
    const instructor = await this.prisma.user.findUnique({
      where: { id: instId },
    });

    if (!instructor)
      throw new NotFoundException(USER_MESSAGES.NOT_FOUND_ACCOUNT);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const course = await this.prisma.course.update({
      where: { id, instructorId: instId },
      data: dto,
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return { data: course };
  }
  public async deleteCourse(id: string, instId: string) {
    const instructor = await this.prisma.user.findUnique({
      where: { id: instId },
    });

    if (!instructor)
      throw new NotFoundException(USER_MESSAGES.NOT_FOUND_ACCOUNT);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await this.prisma.course.delete({ where: { id, instructorId: instId } });

    return { message: COURSE_MESSAGE.DELETE_SUCCESSFUL };
  }
}
