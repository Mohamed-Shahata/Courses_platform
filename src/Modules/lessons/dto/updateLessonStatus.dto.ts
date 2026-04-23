import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { LessonStatus } from 'generated/prisma/enums';

export class updateLessonStatus {
  @ApiProperty({ enum: LessonStatus, example: LessonStatus.APPROVED, description: 'Lesson status' })
  @IsEnum(LessonStatus, { message: 'Status must be a valid LessonStatus value' })
  @IsNotEmpty({ message: 'Status cannot be empty' })
  status: LessonStatus;
}
