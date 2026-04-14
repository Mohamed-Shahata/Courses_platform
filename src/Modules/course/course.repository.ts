import { Injectable } from '@nestjs/common';
import { DataBaseService } from '../db/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CourseRepository {
  constructor(private prisma: DataBaseService) {}

  create(data: Prisma.CourseCreateInput) {
    return this.prisma.course.create({ data });
  }

  findAll(where: Prisma.CourseWhereInput) {
    return this.prisma.course.findMany({
      where,
    });
  }

  findById(id: string) {
    return this.prisma.course.findUnique({
      where: { id },
    });
  }

  findByInst(instId: string) {
    return this.prisma.course.findMany({
      where: { instructorId: instId },
    });
  }

  findByIdAndUser(id: string, userId: string) {
    return this.prisma.course.findMany({
      where: { id, instructor: { userId } },
    });
  }

  update(id: string, instId: string, data: Prisma.CourseUpdateInput) {
    return this.prisma.course.update({
      where: { id, instructorId: instId },
      data,
    });
  }

  delete(id: string, instId: string) {
    return this.prisma.course.delete({ where: { id, instructorId: instId } });
  }
}
