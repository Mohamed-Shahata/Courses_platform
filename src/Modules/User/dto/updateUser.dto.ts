import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class updateUserDTO {
  @ApiPropertyOptional({ example: 'John', description: 'User first name' })
  @IsString()
  @IsOptional()
  first_name: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'User last name' })
  @IsString()
  @IsOptional()
  last_name: string;

  @ApiPropertyOptional({ example: 'john.doe@example.com', description: 'User email' })
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiPropertyOptional({ example: '01234567890', description: 'User phone number', minLength: 11, maxLength: 11 })
  @IsString()
  @Length(11, 11, { message: 'Phone number must be exactly 11 digits' })
  @IsOptional()
  phone: string;
}
