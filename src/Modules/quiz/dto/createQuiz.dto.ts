import { IsString } from 'class-validator';

export class createQuizDTO {
  @IsString()
  name: string;
}
