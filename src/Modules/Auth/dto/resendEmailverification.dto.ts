import { IsEmail } from 'class-validator';

export class resendEmailVerification {
  @IsEmail()
  email: string;
}
