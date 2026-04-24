import { IsArray, IsOptional, IsString } from 'class-validator';

export class updateQuestionDTO {
  @IsString()
  @IsOptional()
  question: string;

  @IsArray()
  @IsOptional()
  options: string[];

  @IsString()
  @IsOptional()
  correctAnswer: string;
}
