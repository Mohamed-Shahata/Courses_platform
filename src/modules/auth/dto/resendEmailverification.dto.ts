import { IsEmail } from 'class-validator';

export class ResendEmailVerification {
  @IsEmail()
  email: string;
}
