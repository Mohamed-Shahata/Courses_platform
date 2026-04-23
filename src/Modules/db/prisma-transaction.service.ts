import { Injectable } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionClient } from 'generated/prisma/internal/prismaNamespace';
import { DataBaseService } from './database.service';

@Injectable()
export class PrismaTransactionService implements TransactionService {
  constructor(private prisma: DataBaseService) {}

  runInTransaction<T>(
    callback: (tx: TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      return callback(tx);
    });
  }
}
