import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DataBaseService } from '../DB/database.service';
import { RegisterDTO } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../../shared/mail/mail.service';
import { LoginDTO } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { StringValue } from 'ms';
import { JwtPayloadType } from 'src/shared/types/jwtPayloadType';
import { AUTH_MESSAGES } from 'src/shared/constants/messages';
import {
  generateApiKey,
  generateApiSecretHash,
  generateverificationToken,
} from 'src/shared/utils/generate.util';
import { resendEmailVerification } from './dto/resendEmailverification.dto';
import { mintesToMilliseconds } from 'src/shared/utils/cookie.util';

@Injectable()
export class AuthService {
  constructor(
    private prisma: DataBaseService,
    private config: ConfigService,
    private mailService: MailService,
    private jwtService: JwtService,
  ) {}

  public async register(dto: RegisterDTO) {
    const { name, email, password, business_name, currency, webhook_url } = dto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (user) throw new NotFoundException(AUTH_MESSAGES.EMAIL_ALREADY_EXISTS);

    const passwordHash = await bcrypt.hash(password, 10);
    const api_key = generateApiKey();

    const api_secret_hash = await generateApiSecretHash();

    const verificationToken = generateverificationToken();
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
        expiresAt: new Date(Date.now() + mintesToMilliseconds(15)),
      },
    });
    const link = `${this.config.get<string>('DOMAIN')}/api/v1/auth/verify-email?token=${verificationToken}`;

    await this.mailService.sendVerifyEmail(email, link);

    return {
      message: AUTH_MESSAGES.VERIFICATION_EMAIL_SENT,
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

    if (!record) throw new BadRequestException(AUTH_MESSAGES.INVALID_TOKEN);
    if (record.expiresAt < new Date())
      throw new BadRequestException(AUTH_MESSAGES.TOKEN_EXPORED);

    await this.prisma.user.update({
      where: { id: record.userId },
      data: { isVerified: true },
    });

    await this.prisma.emailVerification.delete({
      where: { token: record.token },
    });

    return { message: AUTH_MESSAGES.EMAIL_VERIFIED };
  }

  public async login(dto: LoginDTO) {
    const { email, password } = dto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) throw new BadRequestException(AUTH_MESSAGES.ACCOUNT_NOT_FOUND);

    if (!user.isVerified)
      throw new BadRequestException(AUTH_MESSAGES.EMAIL_NOT_VERIFIED);

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch)
      throw new BadRequestException(AUTH_MESSAGES.INCORRECT_PASSWORD);

    const payload: JwtPayloadType = { id: user.id };
    const accessToken = await this.jwtService.signAsync(payload);

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>(
        'JWT_REFRESH_EXPIRES_IN',
      ) as StringValue,
    });

    const Hrefresh = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: Hrefresh },
    });

    return { message: AUTH_MESSAGES.LOGIN_SUCCESS, accessToken, refreshToken };
  }

  public async getAccessToken(refreshToken: string) {
    const payload: JwtPayloadType = await this.jwtService.verifyAsync(
      refreshToken,
      {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      },
    );

    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
    });
    if (!user || !user.refreshToken)
      throw new BadRequestException(AUTH_MESSAGES.ACCESS_DENIED);

    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isMatch)
      throw new BadRequestException(AUTH_MESSAGES.INVALID_REFRESH_TOKEN);

    const accessToken = await this.jwtService.signAsync({ id: user.id });

    return { data: { accessToken } };
  }

  public async resendEmailVerification(dto: resendEmailVerification) {
    const { email } = dto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) throw new BadRequestException(AUTH_MESSAGES.ACCOUNT_NOT_FOUND);

    if (user.isVerified)
      throw new BadRequestException(AUTH_MESSAGES.ACCOUNT_VERIFIED);

    const emailVerify = await this.prisma.emailVerification.findUnique({
      where: { userId: user.id },
    });

    if (emailVerify) {
      await this.prisma.emailVerification.delete({
        where: { id: emailVerify.id },
      });
    }

    const verificationToken = generateverificationToken();

    await this.prisma.emailVerification.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt: new Date(Date.now() + mintesToMilliseconds(15)),
      },
    });
    const link = `${this.config.get<string>('DOMAIN')}/api/v1/auth/verify-email?token=${verificationToken}`;

    await this.mailService.sendVerifyEmail(email, link);

    return {
      message: AUTH_MESSAGES.VERIFICATION_EMAIL_SENT,
    };
  }
}
