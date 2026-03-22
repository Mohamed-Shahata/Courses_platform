import { IsNumber, IsOptional, IsString } from 'class-validator';

export class updateLessonDTO {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  videoUrl: string;

  @IsNumber()
  @IsOptional()
  order: number;
}
