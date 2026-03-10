import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDTO } from './dto/register.dto';

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
}
