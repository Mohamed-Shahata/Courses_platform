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

interface RequestWithCookies extends Request {
  cookies: {
    refreshToken?: string;
  };
}
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  public async register(@Body() body: RegisterDTO) {
    return await this.authService.register(body);
  }

  @Get('verify-email')
  public async verify_email(@Query('token') token: string) {
    if (!token) throw new BadRequestException('no token provider');

    return await this.authService.verify_email(token);
  }

  @Post('login')
  public async login(
    @Res({ passthrough: true }) res: Response,
    @Body() body: LoginDTO,
  ) {
    const { message, accessToken, refreshToken } =
      await this.authService.login(body);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { message, accessToken };
  }

  public async getAccessToken(@Req() req: RequestWithCookies) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) throw new BadRequestException('no refresh token ');

    return await this.authService.getAccessToken(refreshToken);
  }
}
