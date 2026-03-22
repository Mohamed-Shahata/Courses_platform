import { IsOptional, IsString } from 'class-validator';

export class updateCategoryDTO {
  @IsString()
  @IsOptional()
  name: string;
}
