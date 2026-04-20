import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DataBaseService } from '../db/database.service';

@Injectable()
export class InstructorRepository {
  constructor(private prisma: DataBaseService) {}

  async createInst(userId: string, tx: Prisma.TransactionClient) {
    const inst = await tx.instructor.create({
      data: {
        User: {
          connect: {
            id: userId,
          },
        },
      },
    });
    return inst;
  }

  async findByUserId(userId: string) {
    return this.prisma.instructor.findUnique({
      where: { userId },
    });
  }
}
