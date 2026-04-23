import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterDTO } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';
import { LoginDTO } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { StringValue } from 'ms';
import { JwtPayloadType } from '../../shared/types/jwtPayloadType';
import { AUTH_MESSAGES } from '../../shared/constants/messages';
import { generateToken } from '../../shared/utils/generate.util';
import { ResendEmailVerification } from './dto/resendEmailverification.dto';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { restoreAccountDTO } from './dto/restoreAccount.dto';
import { UserRepository } from '../user/user.repository';
import { UserTokenRepository } from './userToken.repository';
import { StudentRepository } from '../student/student.repository';
import { InstructorRepository } from '../instructor/instructor.repository';
import { OutBoxRepository } from './outbox.repository';
import { TransactionService } from '../db/transaction.service';
import { RoleUser } from 'src/shared/enums/RoleUser.enum';
import { EVENT_TYPE } from '../../../generated/prisma/enums';
import { mintesToMilliseconds } from 'src/shared/utils/cookie.util';
import { randomBytes } from 'node:crypto';
import { SelectRoleDto } from './dto/selectRole.dto';

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
    private jwtService: JwtService,
    private userTokenRepo: UserTokenRepository,
    private outBoxRepo: OutBoxRepository,
    private studentRepo: StudentRepository,
    private instructorRepo: InstructorRepository,
    private transactionService: TransactionService,
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

    const passwordHash = await this.hash(password);
    const token = generateToken();

    return this.transactionService.runInTransaction(async (tx) => {
      const user = await this.userRepo.createUser(
        {
          first_name,
          last_name,
          email,
          role,
          phone,
          password_hash: passwordHash,
        },
        tx,
      );

      if (role === RoleUser.INSTRUCTOR) {
        await this.instructorRepo.createInst(user.id, tx);
      } else {
        await this.studentRepo.createStudent(user.id, tx);
      }

      await this.userTokenRepo.create(
        {
          userId: user.id,
          token,
          type: EVENT_TYPE.SEND_VERIFICATION_EMAIL,
          expiresAt: new Date(Date.now() + mintesToMilliseconds(15)),
        },
        tx,
      );

      await this.outBoxRepo.create(
        {
          event_type: EVENT_TYPE.SEND_VERIFICATION_EMAIL,
          payload: {
            email,
            token,
          },
        },
        tx,
      );

      return { message: AUTH_MESSAGES.VERIFICATION_EMAIL_SENT };
    });
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

    return this.transactionService.runInTransaction(async (tx) => {
      await this.userRepo.verifyEmail(record.userId, tx);

      await this.userTokenRepo.deleteById(record.id, tx);
      return { message: AUTH_MESSAGES.EMAIL_VERIFIED };
    });
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

    const fakeHash = '$2b$10$abcdefghijklmnopqrstuv1234567890';

    const user = await this.userRepo.findByEmail(email);

    let isValid = false;
    if (user) {
      isValid = await this.compare(password, user.password_hash);
    } else {
      isValid = await this.compare(password, fakeHash);
    }
    if (!user || !isValid)
      throw new BadRequestException(AUTH_MESSAGES.INVALID_EMAIL_OR_PASSWORD);

    if (user.isDelete)
      throw new BadRequestException(AUTH_MESSAGES.ACCOUNT_DELETE);
    if (!user.isVerified)
      throw new BadRequestException(AUTH_MESSAGES.EMAIL_NOT_VERIFIED);

    const payload: JwtPayloadType = { id: user.id, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>(
        'JWT_REFRESH_EXPIRES_IN',
      ) as StringValue,
    });

    const Hrefresh = await this.hash(refreshToken);
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
  public async requsetRestore(dto: restoreAccountDTO) {
    const { email } = dto;

    const user = await this.userRepo.findByEmail(email);

    // must check account is deleted or not
    if (user && user.isDelete) {
      const token = generateToken();

      await this.transactionService.runInTransaction(async (tx) => {
        await this.userTokenRepo.create(
          {
            userId: user.id,
            token,
            type: EVENT_TYPE.SEND_RESTORE_ACCOUNT,
            expiresAt: new Date(Date.now() + mintesToMilliseconds(15)),
          },
          tx,
        );

        await this.outBoxRepo.create(
          {
            event_type: EVENT_TYPE.SEND_RESTORE_ACCOUNT,
            payload: {
              email,
              token,
            },
          },
          tx,
        );
      });
    }

    return { message: AUTH_MESSAGES.RESET_LINK };
  }

  public async confirmRestore(token: string) {
    const record = await this.userTokenRepo.findByToken(token);

    if (!record) throw new BadRequestException(AUTH_MESSAGES.INVALID_TOKEN);
    if (record.expiresAt < new Date())
      throw new BadRequestException(AUTH_MESSAGES.TOKEN_EXPORED);

    return this.transactionService.runInTransaction(async (tx) => {
      await this.userRepo.restoreAccount(record.userId, tx);

      await this.userTokenRepo.deleteById(record.token, tx);
      return { message: AUTH_MESSAGES.EMAIL_VERIFIED };
    });
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

    const isMatch = await this.compare(refreshToken, user.refreshToken);
    if (!isMatch)
      throw new BadRequestException(AUTH_MESSAGES.INVALID_REFRESH_TOKEN);

    const accessToken = await this.jwtService.signAsync({
      id: user.id,
      role: user.role,
    });

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

    if (user && !user.isVerified) {
      await this.transactionService.runInTransaction(async (tx) => {
        const emailVerify = await this.userTokenRepo.findByUserIdAndType({
          userId: user.id,
          type: 'SEND_VERIFICATION_EMAIL',
        });

        if (emailVerify) {
          await this.userTokenRepo.deleteById(emailVerify.id, tx);
        }

        const token = generateToken();
        await this.userTokenRepo.create(
          {
            userId: user.id,
            token,
            type: EVENT_TYPE.SEND_VERIFICATION_EMAIL,
            expiresAt: new Date(Date.now() + mintesToMilliseconds(15)),
          },
          tx,
        );

        await this.outBoxRepo.create(
          {
            event_type: EVENT_TYPE.SEND_VERIFICATION_EMAIL,
            payload: {
              email,
              token,
            },
          },
          tx,
        );
      });
    }

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

    if (user) {
      await this.transactionService.runInTransaction(async (tx) => {
        const token = generateToken();

        await this.userTokenRepo.create(
          {
            userId: user.id,
            token,
            type: EVENT_TYPE.SEND_RESET_PASSWORD,
            expiresAt: new Date(Date.now() + mintesToMilliseconds(15)),
          },
          tx,
        );

        await this.outBoxRepo.create(
          {
            event_type: EVENT_TYPE.SEND_RESET_PASSWORD,
            payload: {
              email,
              token,
            },
          },
          tx,
        );
      });
    }

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

    const isSamePassword = await this.compare(newPassword, user.password_hash);

    if (isSamePassword)
      throw new BadRequestException(AUTH_MESSAGES.CANNOT_USE_OLD_PASSWORD);

    const hash = await bcrypt.hash(newPassword, 10);
    return this.transactionService.runInTransaction(async (tx) => {
      await this.userRepo.updatePassword(
        reset.userId,
        { password_hash: hash },
        tx,
      );

      await this.userTokenRepo.deleteById(reset.id, tx);

      return { message: AUTH_MESSAGES.CHANGE_PASSWORD_SUCCESSFULL };
    });
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

    const isMatch = await this.compare(currentPassword, user.password_hash);
    if (!isMatch)
      throw new BadRequestException(AUTH_MESSAGES.CURRENT_PASSWORD_INCORRECT);

    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException(
        AUTH_MESSAGES.NEW_PASSWORD_AND_CONFIRM_PASSWORD_NOT_MATCHING,
      );
    }

    const isSamePassword = await this.compare(newPassword, user.password_hash);

    if (isSamePassword)
      throw new BadRequestException(AUTH_MESSAGES.CANNOT_USE_OLD_PASSWORD);

    const hash = await this.hash(newPassword);

    await this.userRepo.updatePassword(userId, { password_hash: hash });

    return { message: AUTH_MESSAGES.CHANGE_PASSWORD_SUCCESSFULL };
  }

  public async GoogleAuthRedirect(
    email: string,
    first_name: string,
    last_name: string,
  ) {
    const user = await this.userRepo.findByEmail(email);

    if (!user) {
      const password = randomBytes(12).toString('hex');

      const hash = await this.hash(password);

      const user = await this.userRepo.createUser({
        first_name,
        last_name,
        email,
        phone: '',
        role: RoleUser.STUDENT,
        password_hash: hash,
      });

      return {
        needRole: true,
        userId: user.id,
        token: null,
      };
    }

    const payload: JwtPayloadType = { id: user.id, role: user.role };

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>(
        'JWT_REFRESH_EXPIRES_IN',
      ) as StringValue,
    });

    const Hrefresh = await this.hash(refreshToken);
    await this.transactionService.runInTransaction(async (tx) => {
      await this.userRepo.updateRefreshToken(
        user.id,
        {
          refreshToken: Hrefresh,
        },
        tx,
      );

      if (!user.isVerified) {
        await this.userRepo.verifyEmail(user.id, tx);
      }
      if (user.isDelete) {
        await this.userRepo.restoreAccount(user.id, tx);
      }
    });

    return {
      token: { refreshToken },
      needRole: false,
      userId: null,
    };
  }

  public async selectRole(userId: string, dto: SelectRoleDto) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new BadRequestException(AUTH_MESSAGES.ACCOUNT_NOT_FOUND);

    const { role } = dto;
    const payload: JwtPayloadType = { id: user.id, role };
    const accessToken = await this.jwtService.signAsync(payload);

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>(
        'JWT_REFRESH_EXPIRES_IN',
      ) as StringValue,
    });

    const Hrefresh = await this.hash(refreshToken);

    return this.transactionService.runInTransaction(async (tx) => {
      await this.userRepo.updateRole(user.id, { role }, tx);

      await this.userRepo.updateRefreshToken(
        user.id,
        {
          refreshToken: Hrefresh,
        },
        tx,
      );

      if (role === RoleUser.INSTRUCTOR) {
        await this.instructorRepo.createInst(user.id, tx);
      } else {
        await this.studentRepo.createStudent(user.id, tx);
      }

      return {
        message: AUTH_MESSAGES.LOGIN_SUCCESS,
        accessToken,
        refreshToken,
      };
    });
  }

  async FacebookAuthRedirect(
    email: string,
    first_name: string,
    last_name: string,
  ) {
    return this.GoogleAuthRedirect(email, first_name, last_name);
  }

  private async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
