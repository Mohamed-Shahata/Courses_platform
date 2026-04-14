import { Injectable } from '@nestjs/common';
import { DataBaseService } from '../db/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class LessonRepository {
  constructor(private prisma: DataBaseService) {}

  countWithCourseId(sectionId: string) {
    return this.prisma.lesson.count({
      where: { sectionId },
    });
  }

  create(data: Prisma.LessonCreateInput) {
    return this.prisma.lesson.create({ data });
  }

  findAllWithSection(sectionId: string) {
    return this.prisma.lesson.findMany({
      where: {
        sectionId,
      },
    });
  }

  findById(id: string) {
    return this.prisma.lesson.findUnique({ where: { id } });
  }

  findByIdByUserId(id: string, userId: string) {
    return this.prisma.lesson.findUnique({
      where: { id, section: { course: { instructor: { userId } } } },
    });
  }

  update(data: Prisma.LessonUpdateInput, id: string, userId: string) {
    return this.prisma.lesson.update({
      where: { id, section: { course: { instructor: { userId } } } },
      data,
    });
  }

  updateStatus(data: Prisma.LessonUpdateInput, id: string) {
    return this.prisma.lesson.update({
      where: { id },
      data,
    });
  }

  delete(id: string, userId: string) {
    return this.prisma.lesson.delete({
      where: { id, section: { course: { instructor: { userId } } } },
    });
  }
}
