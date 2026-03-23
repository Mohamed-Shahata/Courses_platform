import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DataBaseService } from '../db/database.service';
import { RegisterDTO } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../../shared/mail/mail.service';
import { LoginDTO } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { StringValue } from 'ms';
import { JwtPayloadType } from 'src/shared/types/jwtPayloadType';
import { AUTH_MESSAGES } from 'src/shared/constants/messages';
import { generateToken } from 'src/shared/utils/generate.util';
import { ResendEmailVerification } from './dto/resendEmailverification.dto';
import { mintesToMilliseconds } from 'src/shared/utils/cookie.util';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { restoreAccountDTO } from './dto/restoreAccount.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: DataBaseService,
    private config: ConfigService,
    private mailService: MailService,
    private jwtService: JwtService,
  ) {}

  public async register(dto: RegisterDTO) {
    const { first_name, last_name, email, password, role, phone } = dto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (user) throw new NotFoundException(AUTH_MESSAGES.EMAIL_ALREADY_EXISTS);

    const passwordHash = await bcrypt.hash(password, 10);

    const verificationToken = generateToken();
    const Nuser = await this.prisma.user.create({
      data: {
        first_name,
        last_name,
        email,
        password_hash: passwordHash,
        role,
        phone,
      },
    });

    await this.prisma.emailVerification.create({
      data: {
        userId: Nuser.id,
        token: verificationToken,
        expiresAt: new Date(Date.now() + mintesToMilliseconds(15)),
      },
    });
    const link = `${this.config.get<string>('DOMAIN')}/auth/verify-email?token=${verificationToken}`;

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
    if (user.isDelete)
      throw new BadRequestException(AUTH_MESSAGES.ACCOUNT_DELETE);

    if (!user.isVerified)
      throw new BadRequestException(AUTH_MESSAGES.EMAIL_NOT_VERIFIED);

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch)
      throw new BadRequestException(AUTH_MESSAGES.EMAIL_OR_PASSWORD_IS_WRONG);

    const payload: JwtPayloadType = { id: user.id, role: user.role };
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

  public async restoreAccount(dto: restoreAccountDTO) {
    const { email } = dto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) throw new BadRequestException(AUTH_MESSAGES.ACCOUNT_NOT_FOUND);

    await this.prisma.user.update({
      where: { email },
      data: {
        isDelete: false,
      },
    });

    return { message: AUTH_MESSAGES.ACCOUNT_RESTORE };
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

  public async resendEmailVerification(dto: ResendEmailVerification) {
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

    const verificationToken = generateToken();

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

  public async logout(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user || !user.refreshToken)
      throw new BadRequestException(AUTH_MESSAGES.ACCOUNT_NOT_FOUND);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: '' },
    });

    return { message: AUTH_MESSAGES.USER_LOGOUT };
  }
  public async forgotPassword(dto: ForgotPasswordDto) {
    const { email } = dto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) throw new BadRequestException(AUTH_MESSAGES.ACCOUNT_NOT_FOUND);

    const token = generateToken();

    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + mintesToMilliseconds(15)),
      },
    });

    console.log(this.config.get<string>('DOMAIN'));
    const resetLink = `${this.config.get<string>('DOMAIN')}/auth/password/reset?token=${token}`;

    await this.mailService.resetPassword(user.email, resetLink);

    return {
      message: AUTH_MESSAGES.WE_HAVE_SENT_A_PASSWORD_CHANGE_LINK_TO_YOUR_EMAIL,
    };
  }

  public async resetPassword(dto: ResetPasswordDto, token: string) {
    const { confirmNewPassword, newPassword } = dto;

    const reset = await this.prisma.passwordReset.findUnique({
      where: { token },
    });

    if (!reset || reset.expiresAt < new Date()) {
      throw new BadRequestException(AUTH_MESSAGES.INVALID_TOKEN);
    }

    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException(
        AUTH_MESSAGES.NEW_PASSWORD_AND_CONFIRM_PASSWORD_NOT_MATCHING,
      );
    }

    const hash = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: reset.userId },
      data: { password_hash: hash },
    });

    await this.prisma.passwordReset.delete({
      where: { id: reset.id },
    });

    return { message: AUTH_MESSAGES.CHANGE_PASSWORD_SUCCESSFULL };
  }

  public async changePassword(userId: string, dto: ChangePasswordDto) {
    const { confirmNewPassword, currentPassword, newPassword } = dto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException(AUTH_MESSAGES.ACCOUNT_NOT_FOUND);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isMatch) {
      throw new BadRequestException(AUTH_MESSAGES.CURRENT_PASSWORD_INCORRECT);
    }

    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException(
        AUTH_MESSAGES.NEW_PASSWORD_AND_CONFIRM_PASSWORD_NOT_MATCHING,
      );
    }

    const hash = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password_hash: hash },
    });

    return { message: AUTH_MESSAGES.CHANGE_PASSWORD_SUCCESSFULL };
  }
}
