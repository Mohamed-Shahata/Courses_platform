import { Injectable } from '@nestjs/common';
import { DataBaseService } from '../db/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class QuizAttemptRepository {
  constructor(private prisma: DataBaseService) {}

  create(data: Prisma.QuizAttemptCreateInput) {
    return this.prisma.quizAttempt.create({ data });
  }
}
