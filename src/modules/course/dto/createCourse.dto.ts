import { Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsString } from 'class-validator';
import { CourseLevel } from 'generated/prisma/enums';

export class CreateCourseDTO {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @Type(() => Number)
  @IsNumber()
  price: number;

  @Type(() => Boolean)
  @IsBoolean()
  isFree: boolean;

  @IsString()
  level: CourseLevel;

  @IsString()
  language: string;

  @Transform(({ value }) => value.split(','))
  @IsArray()
  tags: string[];
}
