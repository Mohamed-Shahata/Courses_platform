import { IsString } from 'class-validator';
import { LessonStatus } from 'generated/prisma/enums';

export class updateLessonStatus {
  @IsString()
  status: LessonStatus;
}
