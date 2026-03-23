import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class addCategoryDTO {
  @ApiProperty({ example: 'Programming', description: 'Category name' })
  @IsString()
  @IsNotEmpty({ message: 'Category name cannot be empty' })
  name: string;
}
