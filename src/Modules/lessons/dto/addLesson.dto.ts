import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class addLessonDTO {
  @ApiProperty({ example: 'Introduction to Programming', description: 'Lesson title' })
  @IsString()
  @IsNotEmpty({ message: 'Title cannot be empty' })
  title: string;

  @ApiProperty({ example: 1, description: 'Lesson order in the course', minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Order must be 0 or greater' })
  order: number;
}
