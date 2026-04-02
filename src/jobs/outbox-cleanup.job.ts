import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { STATUS_OUTBOX } from '@prisma/client';
import { DataBaseService } from 'src/modules/db/database.service';
import { daysToMilliseconds } from 'src/shared/utils/cookie.util';

@Injectable()
export class OutBoxCleanupJob {
  constructor(private prisma: DataBaseService) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async cleanOutbox() {
    const now = new Date();

    await this.prisma.outbox.deleteMany({
      where: {
        status: STATUS_OUTBOX.SENT,
        created_at: {
          lt: new Date(now.getTime() - daysToMilliseconds(1)),
        },
      },
    });

    await this.prisma.outbox.deleteMany({
      where: {
        status: STATUS_OUTBOX.FAILED,
        created_at: {
          lt: new Date(now.getTime() - daysToMilliseconds(3)),
        },
      },
    });
  }
}
