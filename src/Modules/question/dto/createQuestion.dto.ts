import { IsArray, IsString } from 'class-validator';

export class createQuestionDTO {
  @IsString()
  question: string;

  @IsArray()
  options: string[];

  @IsString()
  correctAnswer: string;
}
