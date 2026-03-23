import { IsEmail } from 'class-validator';

export class restoreAccountDTO {
  @IsEmail()
  email: string;
}
