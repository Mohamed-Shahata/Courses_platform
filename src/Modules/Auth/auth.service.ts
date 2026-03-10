import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { DataBaseService } from '../DB/database.service';
import { RegisterDTO } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../Mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: DataBaseService,
    private config: ConfigService,
    private mailService: MailService,
  ) {}

  public async register(dto: RegisterDTO) {
    const { name, email, password, business_name, currency, webhook_url } = dto;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (user) throw new NotFoundException('this email already in system');

    const passwordHash = await bcrypt.hash(password, 10);
    const api_key = this.generateApiKey();

    const api_secret_hash = await this.generateApiSecretHash();

    const verificationToken = this.generateverificationToken();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await this.prisma.user.create({
      data: {
        name,
        email,
        password_hash: passwordHash,
        api_key,
        api_secret_hash,
        business_name,
        currency,
        webhook_url,
        verificationToken,
      },
    });
    const link = `${this.config.get<string>('DOMAIN')}/api/auth/verify-email/${verificationToken}`;

    await this.mailService.sendVerifyEmail(email, link);

    return {
      message: 'Verification email sent successfully. Please check your inbox.',
    };
  }

  private generateApiKey() {
    const apiKey = 'pk_live_' + randomBytes(24).toString('hex');

    return apiKey;
  }

  private generateverificationToken() {
    const verificationToken = randomBytes(32).toString('hex');

    return verificationToken;
  }

  private async generateApiSecretHash() {
    const apiSecret = 'sk_live_' + randomBytes(48).toString('hex');

    const apiSecretHash = await bcrypt.hash(apiSecret, 10);

    return apiSecretHash;
  }
}
