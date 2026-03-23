import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { CourseLevel } from 'generated/prisma/enums';

export class CreateCourseDTO {
  @ApiProperty({ example: 'Complete Web Development Course', description: 'Course title' })
  @IsString()
  @IsNotEmpty({ message: 'Title cannot be empty' })
  title: string;

  @ApiProperty({ example: 'Learn full-stack development from scratch', description: 'Course description' })
  @IsString()
  @IsNotEmpty({ message: 'Description cannot be empty' })
  description: string;

  @ApiProperty({ example: 99.99, description: 'Course price' })
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Price cannot be negative' })
  price: number;

  @ApiProperty({ example: false, description: 'Whether the course is free' })
  @Type(() => Boolean)
  @IsBoolean()
  isFree: boolean;

  @ApiProperty({ enum: CourseLevel, example: CourseLevel.BEGINNER, description: 'Course level' })
  @IsEnum(CourseLevel, { message: 'Level must be BEGINNER, INTERMEDIATE, or ADVANCED' })
  @IsNotEmpty({ message: 'Level cannot be empty' })
  level: CourseLevel;

  @ApiProperty({ example: 'English', description: 'Course language' })
  @IsString()
  @IsNotEmpty({ message: 'Language cannot be empty' })
  language: string;

  @ApiProperty({ example: 'web,development,javascript', description: 'Comma-separated tags' })
  @Transform(({ value }) => value.split(','))
  @IsArray()
  tags: string[];
}
