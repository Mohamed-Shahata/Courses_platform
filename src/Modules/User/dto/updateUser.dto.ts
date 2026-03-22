import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class updateUserDTO {
  @IsString()
  @IsOptional()
  first_name: string;

  @IsString()
  @IsOptional()
  last_name: string;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  @Length(11)
  @IsOptional()
  phone: string;
}
