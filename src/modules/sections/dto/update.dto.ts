import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class updateSectionDTO {
  @ApiPropertyOptional({
    example: 'Introduction to Programming',
    description: 'Section title',
  })
  @IsString()
  @IsNotEmpty({ message: 'Title cannot be empty' })
  @IsOptional()
  title: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Section order in the course',
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Order must be 0 or greater' })
  @IsOptional()
  order: number;
}
