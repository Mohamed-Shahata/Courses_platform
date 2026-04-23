import { IsString } from 'class-validator';
import { QuizType } from 'generated/prisma/enums';

export class createQuizDTO {
  @IsString()
  name: string;

  @IsString()
  type: QuizType;
}
