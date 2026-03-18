import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { CourseLevel } from 'generated/prisma/enums';

export class CreateCourseDTO {
  @IsString()
  title: string;

  @IsString()
  videoURL: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsBoolean()
  isFree: boolean;

  @IsString()
  level: CourseLevel;

  @IsString()
  language: string;
}
