import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';
import { Response, Request } from 'express';
import { PRODUCTION, REFRESH_TOKEN } from 'src/shared/constants/variables';
import { ConfigService } from '@nestjs/config';
import { daysToMilliseconds } from 'src/shared/utils/cookie.util';
import { AUTH_MESSAGES } from 'src/shared/constants/messages';
import { resendEmailVerification } from './dto/resendEmailverification.dto';
import { AuthGuard } from './guards/auth.guard';
import { CurrentUser } from './decorator/current-user.decorator';
import { JwtPayloadType } from 'src/shared/types/jwtPayloadType';
import { ResendEmailVerification } from './dto/resendEmailverification.dto';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';

interface RequestWithCookies extends Request {
  cookies: {
    refreshToken?: string;
  };
}
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
  ) {}

  // POST => ~/auth/register
  @Post('register')
  public register(@Body() body: RegisterDTO) {
    return this.authService.register(body);
  }

  // POST => ~/auth/verify-email
  @Get('verify-email')
  public verify_email(@Query('token') token: string) {
    if (!token) throw new BadRequestException(AUTH_MESSAGES.NO_TOKEN_PROVIDER);

    return this.authService.verify_email(token);
  }

  // POST => ~/auth/login
  @Post('login')
  public async login(
    @Res({ passthrough: true }) res: Response,
    @Body() body: LoginDTO,
  ) {
    const { message, accessToken, refreshToken } =
      await this.authService.login(body);

    res.cookie(REFRESH_TOKEN, refreshToken, {
      httpOnly: true,
      secure: this.config.get<string>('NODE_ENV') == PRODUCTION ? true : false,
      sameSite: 'strict',
      maxAge: daysToMilliseconds(7),
    });

    return { message, data: { accessToken } };
  }

  // POST ~/auth/access-token
  @Post('access-token')
  public getAccessToken(@Req() req: RequestWithCookies) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
      throw new BadRequestException(AUTH_MESSAGES.NO_REFRESH_TOKEN);

    return this.authService.getAccessToken(refreshToken);
  }

  // POST ~/auth/resend-email
  @Post('resend-email')
  public resendEmailVerification(@Body() body: ResendEmailVerification) {
    return this.authService.resendEmailVerification(body);
  }

  //Get ~/auth/logout
  @Get('logout')
  @UseGuards(AuthGuard)
  public async logout(
    @CurrentUser() user: JwtPayloadType,
    @Res({ passthrough: true }) res: Response,
  ) {
    const response = await this.authService.logout(user.id);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: this.config.get<string>('NODE_ENV') == PRODUCTION ? true : false,
      sameSite: 'strict',
    });

    return response;
  // POST ~/auth/password/forgot
  @Post('password/forgot')
  public forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body);
  }

  // POST ~/auth/password/reset
  @Post('password/reset')
  public ResetPassword(@Body() body: ResetPasswordDto, @Query('token') token:string) {
    return this.authService.resetPassword(body, token);
  }

  // PATCH ~/auth/password/change
  @UseGuards(JwtAuthGuard)
  @Patch('password/change')
  changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, dto);
  }
}
