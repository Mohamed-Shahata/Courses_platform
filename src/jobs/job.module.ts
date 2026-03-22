import { Module } from '@nestjs/common';
import { UserCleanupJob } from './user-cleanup.job';
import { DataBaseModule } from 'src/modules/db/database.module';

@Module({
  providers: [UserCleanupJob],
  imports: [DataBaseModule],
})
export class JobModule {}
