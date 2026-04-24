import { Injectable } from '@nestjs/common';
import { DataBaseService } from '../db/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class LessonProgressRepository {
  constructor(private prisma: DataBaseService) {}

  countWithStudIdAndsectionId(userId: string, sectionId: string) {
    return this.prisma.lessonProgress.count({
      where: {
        student: { userId },
        lesson: { sectionId },
        completed: true,
      },
    });
  }

  create(data: Prisma.LessonProgressCreateInput) {
    return this.prisma.lessonProgress.create({ data });
  }
}
