import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class OutBoxRepository {
  async create(data: Prisma.OutboxCreateInput, tx: Prisma.TransactionClient) {
    await tx.outbox.create({
      data,
    });
  }
}
