import { Injectable } from '@nestjs/common';
import { DataBaseService } from '../db/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SectionRepository {
  constructor(private prisma: DataBaseService) {}

  create(data: Prisma.SectionCreateInput) {
    return this.prisma.section.create({ data });
  }

  findByIdUser(id: string, userId: string) {
    return this.prisma.section.findUnique({
      where: {
        id,
        course: {
          instructor: {
            userId,
          },
        },
      },
    });
  }

  find(id: string) {
    return this.prisma.section.findUnique({
      where: { id },
    });
  }

  findByIdCourse(courseId: string) {
    return this.prisma.section.findMany({
      where: { courseId },
    });
  }

  update(data: Prisma.SectionUpdateInput, id: string, userId: string) {
    return this.prisma.section.update({
      where: { id, course: { instructor: { userId } } },
      data,
    });
  }

  delete(id: string, userId: string) {
    return this.prisma.section.delete({
      where: { id, course: { instructor: { userId } } },
    });
  }
}
