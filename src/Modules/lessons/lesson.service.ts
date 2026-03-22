import { BadRequestException, Injectable } from '@nestjs/common';
import { DataBaseService } from '../db/database.service';
import { addLessonDTO } from './dto/addLesson.dto';
import { COURSE_MESSAGE, LESSON_MESSAGE } from 'src/shared/constants/messages';
import { updateLessonDTO } from './dto/updateLesson.dto';
import { updateLessonStatus } from './dto/updateLessonStatus.dto';

@Injectable()
export class LessonService {
  constructor(private prisma: DataBaseService) {}

  public async createLesson(
    dto: addLessonDTO,
    instId: string,
    courseId: string,
    videoUrl: string,
  ) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId, instructorId: instId },
    });
    if (!course) throw new BadRequestException(COURSE_MESSAGE.NOT_FOUND_COURSE);

    const { title, order } = dto;

    const lesson = await this.prisma.lesson.create({
      data: {
        title,
        videoUrl,
        order,
        courseId,
      },
    });

    return { data: lesson };
  }

  public async getAlllessonWithCourse(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) throw new BadRequestException(COURSE_MESSAGE.NOT_FOUND_COURSE);

    const lessons = await this.prisma.lesson.findMany({
      where: { courseId },
    });

    return { data: lessons };
  }

  public async getLessonById(id: string) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });

    if (!lesson) throw new BadRequestException(LESSON_MESSAGE.NO_LESSON);

    return { data: lesson };
  }

  public async updateLesson(dto: updateLessonDTO, id: string) {
    const Nlesson = await this.prisma.lesson.update({
      where: { id },
      data: dto,
    });

    if (!Nlesson) throw new BadRequestException(LESSON_MESSAGE.NO_LESSON);

    return { data: Nlesson };
  }

  public async deleteLesson(id: string) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });

    if (!lesson) throw new BadRequestException(LESSON_MESSAGE.NO_LESSON);

    await this.prisma.lesson.delete({ where: { id } });

    return { message: LESSON_MESSAGE.DELETE_SUCCESSFUL };
  }

  public async updateLessonStatus(lessonId: string, dto: updateLessonStatus) {
    const lesson = await this.prisma.lesson.update({
      where: { id: lessonId },
      data: dto,
    });

    if (!lesson) throw new BadRequestException(LESSON_MESSAGE.NO_LESSON);
    return { data: lesson };
  }
}
