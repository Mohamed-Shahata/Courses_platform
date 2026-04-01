import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataBaseService } from 'src/modules/db/database.service';
import { daysToMilliseconds } from 'src/shared/utils/cookie.util';

@Injectable()
export class UserCleanupJob {
  constructor(private prisma: DataBaseService) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async deleteUnverifiedUsers() {
    const fifteenDays = new Date(Date.now() - daysToMilliseconds(15));

    await this.prisma.user.deleteMany({
      where: {
        isVerified: false,
        created_at: {
          lt: fifteenDays,
        },
      },
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async deleteSoftDeletedUsers() {
    const tenDays = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

    await this.prisma.user.deleteMany({
      where: {
        isDelete: true,
        deleteAt: {
          lt: tenDays,
        },
      },
    });
  }
}
