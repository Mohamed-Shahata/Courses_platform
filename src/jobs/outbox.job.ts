import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EVENT_TYPE, STATUS_OUTBOX } from 'generated/prisma/enums';
import { DataBaseService } from 'src/modules/db/database.service';
import { MailService } from 'src/shared/mail/mail.service';
import { mintesToMilliseconds } from 'src/shared/utils/cookie.util';

@Injectable()
export class OutboxJob {
  constructor(
    private prisma: DataBaseService,
    private config: ConfigService,
    private mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async processOutbox() {
    const now = new Date();

    const messages = await this.prisma.outbox.findMany({
      where: {
        status: STATUS_OUTBOX.PENDING,
        nextRetryAt: { lte: now },
      },
      take: 10,
      orderBy: {
        created_at: 'asc',
      },
    });

    for (const msg of messages) {
      const { email, token } = msg.payload as {
        email: string;
        token: string;
      };
      try {
        if (msg.event_type === EVENT_TYPE.SEND_VERIFICATION_EMAIL) {
          const link = `${this.config.get<string>('DOMAIN_FRONTEND_LOCAL')}/auth/verify-email?token=${token}`;

          await this.mailService.sendVerifyEmail(email, link);
        }

        if (msg.event_type === EVENT_TYPE.SEND_RESET_PASSWORD) {
          const link = `${this.config.get<string>('DOMAIN_FRONTEND_LOCAL')}/api/v1/auth/password/reset?token=${token}`;

          await this.mailService.resetPassword(email, link);
        }

        await this.prisma.outbox.update({
          where: { id: msg.id },
          data: {
            status: STATUS_OUTBOX.SENT,
          },
        });
      } catch (err) {
        console.log(err);
        const newRetryCount = Number(msg.retryCount + 1);
        const delay = this.getDelay(newRetryCount);

        const newStatus =
          newRetryCount >= 3 ? STATUS_OUTBOX.FAILED : STATUS_OUTBOX.PENDING;

        await this.prisma.outbox.update({
          where: { id: msg.id },
          data: {
            status: newStatus,
            retryCount: newRetryCount,
            nextRetryAt: new Date(Date.now() + delay),
          },
        });
      }
    }
  }

  private getDelay(retryCount: number): number {
    if (retryCount === 1) return mintesToMilliseconds(1);
    if (retryCount === 2) return mintesToMilliseconds(5);
    if (retryCount === 3) return mintesToMilliseconds(15);

    return mintesToMilliseconds(60);
  }
}
