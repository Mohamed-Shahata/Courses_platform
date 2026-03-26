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
import { ResendEmailVerification } from './dto/resendEmailverification.dto';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { restoreAccountDTO } from './dto/restoreAccount.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiCookieAuth,
} from '@nestjs/swagger';

interface RequestWithCookies extends Request {
  cookies: {
    refreshToken?: string;
  };
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
  ) {}

  // POST => ~/auth/register
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully. Verification email sent.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation error or email already exists',
  })
  public register(@Body() body: RegisterDTO) {
    return this.authService.register(body);
  }

  // GET => ~/auth/verify-email
  @Get('verify-email')
  @ApiOperation({ summary: 'Verify user email via token' })
  @ApiQuery({
    name: 'token',
    required: true,
    description: 'Email verification token',
  })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - No token provided or invalid token',
  })
  public verify_email(@Query('token') token: string) {
    if (!token) throw new BadRequestException(AUTH_MESSAGES.NO_TOKEN_PROVIDER);
    return this.authService.verify_email(token);
  }

  // POST => ~/auth/login
  @Post('login')
  @ApiOperation({ summary: 'Login and receive access token' })
  @ApiResponse({
    status: 200,
    description:
      'Login successful. Returns accessToken. Sets refreshToken cookie.',
    schema: {
      example: {
        message: 'Logged in successfully',
        data: { accessToken: 'jwt...' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid credentials',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Email not verified',
  })
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

  // POST => ~/auth/restore
  @Post('restore')
  @ApiOperation({ summary: 'Restore a previously deleted account' })
  @ApiResponse({ status: 200, description: 'Account restored successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  public async restoreAccount(@Body() body: restoreAccountDTO) {
    return this.authService.restoreAccount(body);
  }

  // POST ~/auth/access-token
  @Post('access-token')
  @ApiCookieAuth('refreshToken')
  @ApiOperation({ summary: 'Get new access token using refresh token cookie' })
  @ApiResponse({ status: 200, description: 'Returns new access token' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - No refresh token provided',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired refresh token',
  })
  public getAccessToken(@Req() req: RequestWithCookies) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
      throw new BadRequestException(AUTH_MESSAGES.NO_REFRESH_TOKEN);
    return this.authService.getAccessToken(refreshToken);
  }

  // POST ~/auth/resend-email
  @Post('resend-email')
  @ApiOperation({ summary: 'Resend email verification link' })
  @ApiResponse({ status: 200, description: 'Verification email resent' })
  @ApiResponse({ status: 404, description: 'User not found' })
  public resendEmailVerification(@Body() body: ResendEmailVerification) {
    return this.authService.resendEmailVerification(body);
  }

  // POST ~/auth/logout
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Logout and clear refresh token cookie' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public async logout(
    @CurrentUser('id') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const response = await this.authService.logout(userId);

    res.clearCookie(REFRESH_TOKEN, {
      httpOnly: true,
      secure: this.config.get<string>('NODE_ENV') == PRODUCTION ? true : false,
      sameSite: 'strict',
    });

    return response;
  }

  // POST ~/auth/password/forgot
  @Post('password/forgot')
  @ApiOperation({ summary: 'Send password reset email' })
  @ApiResponse({ status: 200, description: 'Reset email sent successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  public forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body);
  }

  // POST ~/auth/password/reset
  @Post('password/reset')
  @ApiOperation({ summary: 'Reset password using token from email' })
  @ApiQuery({
    name: 'token',
    required: true,
    description: 'Password reset token',
  })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid or expired token',
  })
  public ResetPassword(
    @Body() body: ResetPasswordDto,
    @Query('token') token: string,
  ) {
    return this.authService.resetPassword(body, token);
  }

  // PATCH ~/auth/password/change
  @UseGuards(JwtAuthGuard)
  @Patch('password/change')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Change password (authenticated user)' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Incorrect current password',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, dto);
  }
}
