import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class addLessonDTO {
  @IsString()
  title: string;

  @Type(() => Number)
  @IsNumber()
  order: number;
}
