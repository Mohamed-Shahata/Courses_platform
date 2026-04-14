import { Injectable } from '@nestjs/common';
import { DataBaseService } from '../db/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class QuizRepository {
  constructor(private prisma: DataBaseService) {}

  create(data: Prisma.QuizCreateInput) {
    return this.prisma.quiz.create({ data });
  }

  find(id: string) {
    return this.prisma.quiz.findUnique({
      where: { id },
    });
  }
  findByLesson(lessonId: string) {
    return this.prisma.quiz.findUnique({
      where: { lessonId },
    });
  }

  findByIdAndUser(id: string, userId: string) {
    return this.prisma.quiz.findUnique({
      where: {
        id,
        lesson: {
          section: {
            course: {
              instructor: {
                userId,
              },
            },
          },
        },
      },
    });
  }

  findManyOfSection(sectionId: string) {
    return this.prisma.quiz.findMany({
      where: {
        lesson: {
          sectionId,
        },
      },
    });
  }

  delete(id: string) {
    return this.prisma.quiz.delete({
      where: { id },
    });
  }
}
