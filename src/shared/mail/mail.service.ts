import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

/**
 * Service responsible for sending transactional emails.
 *
 * Wraps `@nestjs-modules/mailer` and provides named methods for each
 * email type used in the application. Templates are EJS files located
 * in the `mail/templates` directory.
 *
 * @injectable
 */
@Injectable()
export class MailService {
  constructor(private mailservice: MailerService) {}

  /**
   * Sends an email verification link to a newly registered user.
   *
   * Uses the `verify_email` EJS template with a `link` context variable.
   * The verification link expires after 15 minutes.
   *
   * @param email - The recipient's email address.
   * @param link - The full verification URL including the one-time token.
   * @returns A promise that resolves when the email has been dispatched.
   *
   * @example
   * await mailService.sendVerifyEmail(
   *   'user@example.com',
   *   'https://yourdomain.com/auth/verify-email?token=abc123',
   * );
   */
  public async sendVerifyEmail(email: string, link: string): Promise<void> {
    await this.mailservice.sendMail({
      to: email,
      subject: 'verify email',
      template: 'verify_email',
      context: { link },
    });
  }

  /**
   * Sends a password reset link to a user who requested it via forgot-password flow.
   *
   * Uses the `reset_password` EJS template with a `link` context variable.
   * The reset link expires after 15 minutes.
   *
   * @param email - The recipient's email address.
   * @param link - The full reset URL including the one-time token.
   * @returns A promise that resolves when the email has been dispatched.
   *
   * @example
   * await mailService.resetPassword(
   *   'user@example.com',
   *   'https://yourdomain.com/auth/password/reset?token=xyz789',
   * );
   */
  public async resetPassword(email: string, link: string): Promise<void> {
    await this.mailservice.sendMail({
      to: email,
      subject: 'Reset your password',
      template: 'reset_password',
      context: { link },
    });
  }
}