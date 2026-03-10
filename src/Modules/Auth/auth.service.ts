import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
  ) { }

  public async register(dto: RegisterDTO) {
    const { name, email, password, business_name, currency, webhook_url } = dto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (user) throw new NotFoundException('this email already in system');

    const passwordHash = await bcrypt.hash(password, 10);
    const api_key = this.generateApiKey();

    const api_secret_hash = await this.generateApiSecretHash();

    const verificationToken = this.generateverificationToken();
    const Nuser = await this.prisma.user.create({
      data: {
        name,
        email,
        password_hash: passwordHash,
        api_key,
        api_secret_hash,
        business_name,
        currency,
        webhook_url,
      },
    });

    await this.prisma.emailVerification.create({
      data: {
        userId: Nuser.id,
        token: verificationToken,
      },
    });
    const link = `${this.config.get<string>('DOMAIN')}/api/auth/verify-email?token=${verificationToken}`;

    await this.mailService.sendVerifyEmail(email, link);

    return {
      message: 'Verification email sent successfully. Please check your inbox.',
    };
  }

  public async verify_email(token: string) {
    const record = await this.prisma.emailVerification.findUnique({
      where: {
        token,
      },
      include: {
        User: true,
      },
    });

    if (!record) throw new BadRequestException('Invalid token');

    await this.prisma.user.update({
      where: { id: record.userId },
      data: { isVerified: true },
    });

    await this.prisma.emailVerification.delete({
      where: { token: record.token },
    });

    return { message: 'Email verified successfully' };
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
