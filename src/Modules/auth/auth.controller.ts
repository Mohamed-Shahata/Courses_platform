import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
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
import { Response, Request, CookieOptions } from 'express';
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
import { StatusCode } from 'src/shared/enums/statusCode.enum';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import { GoogleGuard } from './guards/google.guard';
import { SelectRoleDto } from './dto/selectRole.dto';
import { FacebookGuard } from './guards/facebook.guard';

interface RequestWithCookies extends Request {
  cookies: {
    refreshToken?: string;
  };
}

interface GoogleAuth {
  email: string;
  first_name: string;
  last_name: string;
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
  @HttpCode(StatusCode.OK)
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

    res.cookie(REFRESH_TOKEN, refreshToken, this.getCookieOptions());

    return { message, data: { accessToken } };
  }

  // Post => ~/auth/restore/request
  @Post('restore/request')
  @HttpCode(StatusCode.OK)
  @ApiOperation({ summary: 'Send restore email' })
  @ApiResponse({ status: 200, description: 'Restore email sent successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  public async requestRestore(@Body() body: restoreAccountDTO) {
    return this.authService.requsetRestore(body);
  }

  // Post => ~/auth/restore/confirm
  @Post('restore/confirm')
  @HttpCode(StatusCode.OK)
  @ApiOperation({ summary: 'Restore account using token for email' })
  @ApiQuery({
    name: 'token',
    required: true,
    description: ' Restore token',
  })
  @ApiResponse({ status: 200, description: 'Restore account successfully' })
  @ApiResponse({
    status: 404,
    description: 'Bad Request - Invalid or expired token',
  })
  public async confirmRestore(@Query('token') token: string) {
    if (!token) throw new BadRequestException(AUTH_MESSAGES.NO_TOKEN_PROVIDER);

    return this.authService.confirmRestore(token);
  }

  // POST ~/auth/refresh
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(StatusCode.OK)
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
  @HttpCode(StatusCode.OK)
  @ApiOperation({ summary: 'Resend email verification link' })
  @ApiResponse({ status: 200, description: 'Verification email resent' })
  @ApiResponse({ status: 404, description: 'User not found' })
  public resendEmailVerification(@Body() body: ResendEmailVerification) {
    return this.authService.resendEmailVerification(body);
  }

  // POST ~/auth/logout
  @Post('logout')
  @HttpCode(StatusCode.OK)
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

    res.clearCookie(REFRESH_TOKEN, this.getCookieOptions());

    return response;
  }

  // POST ~/auth/password/forgot
  @Post('password/forgot')
  @HttpCode(StatusCode.OK)
  @ApiOperation({ summary: 'Send password reset email' })
  @ApiResponse({ status: 200, description: 'Reset email sent successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  public forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body);
  }

  // Patch ~/auth/password/reset
  @Patch('password/reset')
  @HttpCode(StatusCode.OK)
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

  // Get ~/auth/google
  @Get('google')
  @UseGuards(GoogleGuard)
  public googleAuth() {}

  // Get ~/auth/google/callback
  @Get('google/callback')
  @UseGuards(GoogleGuard)
  public async googleAuthRedirect(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const { email, first_name, last_name } = req.user as GoogleAuth;

    const { token, needRole, userId } =
      await this.authService.GoogleAuthRedirect(email, first_name, last_name);

    if (!token || needRole) {
      return res.send(
        `${userId} hello , you are in our web site ,choose your role `,
      );
    }

    res.cookie(REFRESH_TOKEN, token.refreshToken, this.getCookieOptions());

    return res.send(`${userId} hello , your account in the system`);
  }

  // Post ~/auth/select-role
  @Post('select-role')
  @ApiOperation({ summary: 'Select role from user' })
  @ApiQuery({
    name: 'id',
    required: true,
    description: 'user id',
  })
  @ApiResponse({ status: 200, description: 'Select role successful' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation error',
  })
  public async selectRole(
    @Body() body: SelectRoleDto,
    @Query('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, message, accessToken } =
      await this.authService.selectRole(id, body);

    res.cookie(REFRESH_TOKEN, refreshToken, this.getCookieOptions());

    return { message, data: { accessToken } };
  }

  // Get ~/auth/facebook
  @Get('facebook')
  @UseGuards(FacebookGuard)
  public facebookAuth() {}

  // Get ~/auth/facebook/callback
  @Get('facebook/callback')
  @UseGuards(FacebookGuard)
  public async facebookAuthRedirect(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const { email, first_name, last_name } = req.user as GoogleAuth;
    const { token, needRole, userId } =
      await this.authService.FacebookAuthRedirect(email, first_name, last_name);

    if (!token || needRole) {
      return res.send(
        `${userId} hello , you are in our web site , choose your role`,
      );
    }

    res.cookie(REFRESH_TOKEN, token.refreshToken, this.getCookieOptions());

    return res.send(`${userId} hello , your account in the system`);
  }

  private getCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.config.get<string>('NODE_ENV') === PRODUCTION,
      sameSite: 'none',
      maxAge: daysToMilliseconds(7),
    };
  }
}
