import { IsString } from 'class-validator';

export class addCategoryDTO {
  @IsString()
  name: string;
}
