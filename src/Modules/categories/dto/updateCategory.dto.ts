import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class updateCategoryDTO {
  @ApiPropertyOptional({ example: 'Web Development', description: 'Category name' })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Category name cannot be empty if provided' })
  name: string;
}
