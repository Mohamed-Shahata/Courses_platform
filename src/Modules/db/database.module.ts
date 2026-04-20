import { Module } from '@nestjs/common';
import { DataBaseService } from './database.service';
import { TransactionService } from './transaction.service';
import { PrismaTransactionService } from './prisma-transaction.service';

@Module({
  providers: [
    DataBaseService,
    {
      provide: TransactionService,
      useClass: PrismaTransactionService,
    },
  ],
  exports: [DataBaseService, TransactionService],
})
export class DataBaseModule {}
