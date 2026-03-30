import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { RoleUser } from 'src/shared/enums/RoleUser.enum';
export class RegisterDTO {
  @ApiProperty({ example: 'John', description: 'First name' })
  @IsString()
  @IsNotEmpty({ message: 'First name cannot be empty' })
  first_name: string;

  @ApiProperty({ example: 'Doe', description: 'Last name' })
  @IsString()
  @IsNotEmpty({ message: 'Last name cannot be empty' })
  last_name: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email cannot be empty' })
  email: string;

  @ApiProperty({
    example: 'Password123',
    description: 'Password (8-15 characters)',
    minLength: 8,
    maxLength: 15,
  })
  @IsString()
  @Length(8, 15, { message: 'Password must be between 8 and 15 characters' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
    message: 'Password must contain at least one letter and one number',
  })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  password: string;

  @ApiProperty({
    example: '01234567890',
    description: 'Phone number',
    minLength: 11,
    maxLength: 11,
  })
  @IsString()
  @Length(11, 11, { message: 'Phone number must be exactly 11 digits' })
  @IsNotEmpty({ message: 'Phone number cannot be empty' })
  phone: string;

  @ApiProperty({
    enum: RoleUser,
    example: RoleUser.STUDENT,
    description: 'User role',
  })
  @IsEnum(RoleUser, { message: 'Role must be STUDENT or INSTRUCTOR' }) // CHANGE THAT
  @IsNotEmpty({ message: 'Role cannot be empty' })
  role: RoleUser;
}
