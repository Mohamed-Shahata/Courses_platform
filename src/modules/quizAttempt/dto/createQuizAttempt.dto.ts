import { Type } from 'class-transformer';
import { ArrayMinSize, IsString, ValidateNested } from 'class-validator';

class AnswerDto {
  @IsString()
  questionId: string;

  @IsString()
  answer: string;
}

export class createQuizAttemptDTO {
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  @ArrayMinSize(1)
  answer: AnswerDto[];
}
