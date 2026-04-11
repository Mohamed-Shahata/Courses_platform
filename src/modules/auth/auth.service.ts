import {
  BadRequestException,
  ConflictException,
  Injectable,
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
import { EVENT_TYPE } from 'generated/prisma/enums';
import { UserRepository } from '../user/user.repository';
import { UserTokenRepository } from './userToken.repository';

/**
 * Service responsible for all authentication-related business logic.
 *
 * Handles user registration, email verification, login/logout,
 * token management, and password operations.
 *
 * @injectable
 */
@Injectable()
export class AuthService {
  constructor(
    private userRepo: UserRepository,
    private config: ConfigService,
    private mailService: MailService,
    private jwtService: JwtService,
    private userTokenRepo: UserTokenRepository,
  ) {}

  /**
   * Registers a new user account and sends an email verification link.
   *
   * - Hashes the password before storing.
   * - Creates a time-limited email verification token (15 minutes).
   * - Sends a verification email to the provided address.
   *
   * @param dto - Registration data including name, email, password, role, and phone.
   * @returns A message confirming the verification email was sent.
   * @throws {ConflictException} If the email is already registered.
   *
   * @example
   * await authService.register({
   *   first_name: 'Ahmed',
   *   last_name: 'Ali',
   *   email: 'ahmed@example.com',
   *   password: 'securePass123',
   *   role: ROLE.STUDENT,
   *   phone: '01012345678',
   * });
   */
  public async register(dto: RegisterDTO) {
    const { first_name, last_name, email, password, role, phone } = dto;

    const user = await this.userRepo.findByEmail(email);
    if (user) throw new ConflictException(AUTH_MESSAGES.EMAIL_ALREADY_EXISTS);

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = generateToken();

    await this.userRepo.createUserWithVerification({
      email,
      first_name,
      last_name,
      password_hash: passwordHash,
      phone,
      role,
      token: verificationToken,
    });

    return { message: AUTH_MESSAGES.VERIFICATION_EMAIL_SENT };
  }

  /**
   * Verifies a user's email address using a one-time token.
   *
   * - Validates the token exists and has not expired.
   * - Marks the user as verified in the database.
   * - Deletes the used verification record.
   *
   * @param token - The email verification token from the URL query string.
   * @returns A success message confirming email verification.
   * @throws {BadRequestException} If the token is invalid or expired.
   */
  public async verify_email(token: string) {
    const record = await this.userTokenRepo.findByToken(token);

    if (!record) throw new BadRequestException(AUTH_MESSAGES.INVALID_TOKEN);
    if (record.expiresAt < new Date())
      throw new BadRequestException(AUTH_MESSAGES.TOKEN_EXPORED);

    await this.userRepo.verifyEmail(record.userId);

    await this.userTokenRepo.deleteById(record.token);
    return { message: AUTH_MESSAGES.EMAIL_VERIFIED };
  }

  /**
   * Authenticates a user and issues access and refresh tokens.
   *
   * - Validates the user exists, is not deleted, and is verified.
   * - Compares the provided password against the stored hash.
   * - Signs a short-lived access token and a long-lived refresh token.
   * - Stores a hashed version of the refresh token for future validation.
   *
   * @param dto - Login credentials containing email and password.
   * @returns An object containing a success message, `accessToken`, and `refreshToken`.
   * @throws {BadRequestException} If the account is not found, deleted, not verified, or credentials are wrong.
   *
   * @example
   * const { accessToken, refreshToken } = await authService.login({
   *   email: 'ahmed@example.com',
   *   password: 'securePass123',
   * });
   */
  public async login(dto: LoginDTO) {
    const { email, password } = dto;

    const user = await this.userRepo.findByEmail(email);
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
    await this.userRepo.updateRefreshToken(user.id, { refreshToken: Hrefresh });

    return { message: AUTH_MESSAGES.LOGIN_SUCCESS, accessToken, refreshToken };
  }

  /**
   * Restores a previously soft-deleted user account.
   *
   * Sets the `isDelete` flag back to `false`, allowing the user to log in again.
   *
   * @param dto - DTO containing the email address of the account to restore.
   * @returns A success message confirming account restoration.
   * @throws {BadRequestException} If no account is found with the given email.
   */
  public async restoreAccount(dto: restoreAccountDTO) {
    const { email } = dto;

    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new BadRequestException(AUTH_MESSAGES.ACCOUNT_NOT_FOUND);

    // must check account is deleted or not
    if (!user.isDelete)
      throw new BadRequestException(AUTH_MESSAGES.ACCOUNT_NOT_DELETED);

    await this.userRepo.restoreAccount(email, {
      isDelete: false,
      deleteAt: null,
    });

    return { message: AUTH_MESSAGES.ACCOUNT_RESTORE };
  }

  /**
   * Issues a new access token using a valid refresh token.
   *
   * - Verifies the refresh token signature and expiry.
   * - Compares the provided token against the stored hashed version.
   * - Returns a fresh access token if everything is valid.
   *
   * @param refreshToken - The refresh token extracted from the HTTP-only cookie.
   * @returns An object containing a new `accessToken`.
   * @throws {BadRequestException} If the user is not found, has no stored token, or the token doesn't match.
   */
  public async getAccessToken(refreshToken: string) {
    const payload: JwtPayloadType = await this.jwtService.verifyAsync(
      refreshToken,
      {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      },
    );

    const user = await this.userRepo.findById(payload.id);
    if (!user || !user.refreshToken)
      throw new BadRequestException(AUTH_MESSAGES.ACCESS_DENIED);

    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isMatch)
      throw new BadRequestException(AUTH_MESSAGES.INVALID_REFRESH_TOKEN);

    const accessToken = await this.jwtService.signAsync({ id: user.id });

    return { data: { accessToken } };
  }

  /**
   * Resends the email verification link to a user who hasn't verified yet.
   *
   * - Checks the user exists and is not already verified.
   * - Deletes any existing verification record before creating a new one.
   * - Sends a fresh verification email with a new 15-minute token.
   *
   * @param dto - DTO containing the email address to resend verification to.
   * @returns A message confirming the verification email was resent.
   * @throws {BadRequestException} If the account is not found or is already verified.
   */
  public async resendEmailVerification(dto: ResendEmailVerification) {
    const { email } = dto;

    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new BadRequestException(AUTH_MESSAGES.ACCOUNT_NOT_FOUND);
    if (user.isVerified)
      throw new BadRequestException(AUTH_MESSAGES.ACCOUNT_VERIFIED);

    const emailVerify = await this.userTokenRepo.findByUserIdAndType({
      userId: user.id,
      type: 'SEND_VERIFICATION_EMAIL',
    });

    if (emailVerify) {
      await this.userTokenRepo.deleteById(emailVerify.id);
    }

    const verificationToken = generateToken();

    await this.userRepo.resendVerification(
      user.id,
      user.email,
      verificationToken,
    ); // user object here

    return { message: AUTH_MESSAGES.VERIFICATION_EMAIL_SENT };
  }

  /**
   * Logs out the currently authenticated user.
   *
   * Clears the stored refresh token from the database, invalidating
   * all future token refresh attempts until the user logs in again.
   *
   * @param id - The ID of the authenticated user to log out.
   * @returns A success message confirming the logout.
   * @throws {BadRequestException} If no account or refresh token is found.
   */
  public async logout(id: string) {
    const user = await this.userRepo.findById(id);
    if (!user || !user.refreshToken)
      throw new BadRequestException(AUTH_MESSAGES.ACCOUNT_NOT_FOUND);

    await this.userRepo.updateRefreshToken(user.id, { refreshToken: '' });

    return { message: AUTH_MESSAGES.USER_LOGOUT };
  }

  /**
   * Initiates the forgot-password flow by sending a reset link via email.
   *
   * - Generates a one-time reset token valid for 15 minutes.
   * - Persists the token in `PasswordReset` table.
   * - Sends the reset link to the user's email.
   *
   * @param dto - DTO containing the email address requesting the reset.
   * @returns A message confirming the reset email was sent.
   * @throws {BadRequestException} If no account is found with the given email.
   */
  public async forgotPassword(dto: ForgotPasswordDto) {
    const { email } = dto;

    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new BadRequestException(AUTH_MESSAGES.ACCOUNT_NOT_FOUND);

    const token = generateToken();

    await this.userRepo.forgotPassword({
      userId: user.id,
      email: user.email,
      token,
    });

    return {
      message: AUTH_MESSAGES.WE_HAVE_SENT_A_PASSWORD_CHANGE_LINK_TO_YOUR_EMAIL,
    };
  }

  /**
   * Resets the user's password using a valid reset token from the email link.
   *
   * - Validates the token exists and has not expired.
   * - Confirms `newPassword` and `confirmNewPassword` match.
   * - Hashes and saves the new password.
   * - Deletes the used reset record.
   *
   * @param dto - DTO containing `newPassword` and `confirmNewPassword`.
   * @param token - The password reset token from the URL query string.
   * @returns A success message confirming the password was changed.
   * @throws {BadRequestException} If the token is invalid/expired or passwords don't match.
   */
  public async resetPassword(dto: ResetPasswordDto, token: string) {
    const { confirmNewPassword, newPassword } = dto;

    const reset = await this.userTokenRepo.findByToken(token);
    if (!reset || reset.expiresAt < new Date()) {
      throw new BadRequestException(AUTH_MESSAGES.INVALID_TOKEN);
    }

    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException(
        AUTH_MESSAGES.NEW_PASSWORD_AND_CONFIRM_PASSWORD_NOT_MATCHING,
      );
    }

    const user = await this.userRepo.findById(reset.id);

    if (!user) throw new BadRequestException(AUTH_MESSAGES.ACCOUNT_NOT_FOUND);

    const isSamePassword = await bcrypt.compare(
      newPassword,
      user.password_hash,
    );

    if (isSamePassword)
      throw new BadRequestException(AUTH_MESSAGES.CANNOT_USE_OLD_PASSWORD);

    const hash = await bcrypt.hash(newPassword, 10);

    await this.userRepo.updatePassword(reset.userId, { password_hash: hash });

    await this.userTokenRepo.deleteById(reset.id);

    return { message: AUTH_MESSAGES.CHANGE_PASSWORD_SUCCESSFULL };
  }

  /**
   * Changes the password for an already authenticated user.
   *
   * - Verifies the `currentPassword` against the stored hash.
   * - Confirms `newPassword` and `confirmNewPassword` match.
   * - Hashes and updates the password in the database.
   *
   * @param userId - The ID of the authenticated user changing their password.
   * @param dto - DTO containing `currentPassword`, `newPassword`, and `confirmNewPassword`.
   * @returns A success message confirming the password was changed.
   * @throws {BadRequestException} If the account is not found, current password is wrong, or passwords don't match.
   */
  public async changePassword(userId: string, dto: ChangePasswordDto) {
    const { confirmNewPassword, currentPassword, newPassword } = dto;

    const user = await this.userRepo.findById(userId);
    if (!user) throw new BadRequestException(AUTH_MESSAGES.ACCOUNT_NOT_FOUND);

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch)
      throw new BadRequestException(AUTH_MESSAGES.CURRENT_PASSWORD_INCORRECT);

    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException(
        AUTH_MESSAGES.NEW_PASSWORD_AND_CONFIRM_PASSWORD_NOT_MATCHING,
      );
    }

    const isSamePassword = await bcrypt.compare(
      newPassword,
      user.password_hash,
    );

    if (isSamePassword)
      throw new BadRequestException(AUTH_MESSAGES.CANNOT_USE_OLD_PASSWORD);

    const hash = await bcrypt.hash(newPassword, 10);

    await this.userRepo.updatePassword(userId, { password_hash: hash });

    return { message: AUTH_MESSAGES.CHANGE_PASSWORD_SUCCESSFULL };
  }
}
