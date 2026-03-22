import { IsNumber, IsString, Max, Min } from 'class-validator';

export class addReviewDTO {
  @IsNumber()
  @Min(1, { message: 'rating must be between 1 and 5' })
  @Max(5, { message: 'rating must be between 1 and 5' })
  rating: number;

  @IsString()
  comment: string;
}
