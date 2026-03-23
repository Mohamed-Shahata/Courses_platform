import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class updateLessonDTO {
  @ApiPropertyOptional({ example: 'Updated Lesson Title', description: 'Lesson title' })
  @IsString()
  @IsOptional()
  title: string;

  @ApiPropertyOptional({ example: 'https://example.com/video.mp4', description: 'Video URL' })
  @IsString()
  @IsOptional()
  videoUrl: string;

  @ApiPropertyOptional({ example: 2, description: 'Lesson order', minimum: 0 })
  @IsNumber()
  @Min(0, { message: 'Order must be 0 or greater' })
  @IsOptional()
  order: number;
}
