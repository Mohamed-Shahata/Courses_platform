import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class updateReviewDTO {
  @IsNumber()
  @Min(1, { message: 'rating must be between 1 and 5' })
  @Max(5, { message: 'rating must be between 1 and 5' })
  @IsOptional()
  rating: number;

  @IsString()
  @IsOptional()
  comment: string;
}
