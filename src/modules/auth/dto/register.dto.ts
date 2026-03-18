import { IsEmail, IsString, Length } from 'class-validator';
import { ROLE } from 'generated/prisma/enums';
export class RegisterDTO {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(8, 15)
  password: string;

  @IsString()
  @Length(11)
  phone: string;

  @IsString()
  role: ROLE;
}
