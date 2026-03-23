import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class updateReviewDTO {
  @ApiPropertyOptional({ example: 4, description: 'Rating from 1 to 5', minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1, { message: 'rating must be between 1 and 5' })
  @Max(5, { message: 'rating must be between 1 and 5' })
  @IsOptional()
  rating: number;

  @ApiPropertyOptional({ example: 'Updated comment', description: 'Review comment' })
  @IsString()
  @IsOptional()
  comment: string;
}
