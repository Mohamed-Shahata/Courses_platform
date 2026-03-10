import { IsEmail, IsString, Length } from 'class-validator';

export class RegisterDTO {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  business_name: string;

  @IsString()
  @Length(8, 15)
  password: string;

  @IsString()
  currency: string;

  @IsString()
  webhook_url: string;
}
