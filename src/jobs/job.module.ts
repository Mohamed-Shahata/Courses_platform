import { Module } from '@nestjs/common';
import { UserCleanupJob } from './user-cleanup.job';
import { DataBaseModule } from 'src/modules/db/database.module';
import { OutboxJob } from './outbox.job';
import { MailModule } from 'src/shared/mail/mail.module';

@Module({
  providers: [UserCleanupJob, OutboxJob],
  imports: [DataBaseModule, MailModule],
})
export class JobModule {}
