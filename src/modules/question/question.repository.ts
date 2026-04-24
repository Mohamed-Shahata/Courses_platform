import { Injectable } from '@nestjs/common';
import { DataBaseService } from '../db/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class QuestionRepository {
  constructor(private prisma: DataBaseService) {}

  create(data: Prisma.QuestionCreateInput) {
    return this.prisma.question.create({ data });
  }

  findAllwithQuiz(quizId: string) {
    return this.prisma.question.findMany({
      where: { quizId },
    });
  }

  find(id: string) {
    return this.prisma.question.findUnique({
      where: {
        id,
      },
    });
  }

  findWithIdAndUser(id: string, userId: string) {
    return this.prisma.question.findUnique({
      where: {
        id,
        quiz: { lesson: { section: { course: { instructor: { userId } } } } },
      },
    });
  }

  update(id: string, data: Prisma.QuestionUpdateInput) {
    return this.prisma.question.update({
      where: { id },
      data,
    });
  }

  delete(id: string) {
    return this.prisma.question.delete({
      where: { id },
    });
  }
}
