import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';
import { Response, Request } from 'express';
import { PRODUCTION, REFRESH_TOKEN } from 'src/shared/constants/variables';
import { ConfigService } from '@nestjs/config';
import { daysToMilliseconds } from 'src/shared/utils/cookie.util';
import { AUTH_MESSAGES } from 'src/shared/constants/messages';

interface RequestWithCookies extends Request {
  cookies: {
    refreshToken?: string;
  };
}
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private config: ConfigService,) { }

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
      secure: this.config.get<string>("NODE_ENV") == PRODUCTION ? true : false,
      sameSite: 'strict',
      maxAge: daysToMilliseconds(7),
    });

    return { message, accessToken };
  }

  // not: why this here
  public getAccessToken(@Req() req: RequestWithCookies) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) throw new BadRequestException(AUTH_MESSAGES.NO_REFRESH_TOKEN);

    return this.authService.getAccessToken(refreshToken);
  }
}
