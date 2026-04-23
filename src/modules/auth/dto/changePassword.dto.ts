import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'oldPassword123', description: 'Current password' })
  @IsString()
  @IsNotEmpty({ message: 'Current password cannot be empty' })
  currentPassword: string;

  @ApiProperty({
    example: 'newPassword123',
    description: 'New password',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @IsNotEmpty({ message: 'New password cannot be empty' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
    message: 'Password must contain at least one letter and one number',
  })
  newPassword: string;

  @ApiProperty({
    example: 'newPassword123',
    description: 'Confirm new password',
  })
  @IsString()
  @IsNotEmpty({ message: 'Confirm password cannot be empty' })
  confirmNewPassword: string;
}
