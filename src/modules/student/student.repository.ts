import { Injectable } from '@nestjs/common';
import { DataBaseService } from '../db/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class StudentRepository {
  constructor(private prisma: DataBaseService) {}

  async createStudent(userId: string, tx: Prisma.TransactionClient) {
    const student = await tx.student.create({
      data: {
        User: {
          connect: {
            id: userId,
          },
        },
      },
    });

    return student;
  }

  async findStudentByUserId(userId: string) {
    return this.prisma.student.findUnique({
      where: {
        userId,
      },
      include: {
        User: true,
      },
    });
  }
}
