import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailservice: MailerService) {}

  public async sendVerifyEmail(email: string, link: string) {
    await this.mailservice.sendMail({
      to: email,
      subject: 'verify email',
      template: 'verify_email',
      context: { link },
    });
  }

  public async resetPassword(email: string, link: string,) {
    await this.mailservice.sendMail({
      to: email,
      subject: 'Reset your password',
      template: 'reset_password',
      context: { link },
    });
  }
}
