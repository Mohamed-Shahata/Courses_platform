import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailservice: MailerService) {}

  public async sendVerifyEmail(email: string, link: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await this.mailservice.sendMail({
      to: email,
      subject: 'verify email',
      template: 'verify_email',
      context: { link },
    });
  }
}
