import { Injectable } from '@nestjs/common';
import { DataBaseService } from '../db/database.service';
import {
  ICreateUser,
  IUpdateUser,
  IUpdatePassword,
  IUpdateRefreshToken,
  IRestoreAccount,
  ICreateUserToken,
  ICreateUserWithVerification,
} from './types/user.types';
import { EVENT_TYPE, ROLE } from '../../../generated/prisma/client';
import { mintesToMilliseconds } from '../../shared/utils/cookie.util';

/**
 * Repository responsible for all direct database operations on the User model.
 *
 * No business logic here — only Prisma calls.
 * Both AuthService and UserService consume this repository.
 */
@Injectable()
export class UserRepository {
  constructor(private prisma: DataBaseService) {}

  // ==================== Queries ====================

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findByIdSelect(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        role: true,
      },
    });
  }

  findByRole(role: ROLE) {
    return this.prisma.user.findMany({
      where: { role },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        role: true,
      },
    });
  }

  findByIdForGuard(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });
  }

  // ==================== Mutations ====================

  async createUserWithVerification(data: ICreateUserWithVerification) {
    return this.prisma.$transaction(async (tx) => {
      // 1. create user
      const user = await tx.user.create({
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          password_hash: data.password_hash,
          role: data.role,
          phone: data.phone,
        },
      });

      // 2. create verification token
      await tx.userToken.create({
        data: {
          userId: user.id,
          token: data.token,
          type: 'SEND_VERIFICATION_EMAIL',
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      });

      // 3. create outbox event
      await tx.outbox.create({
        data: {
          event_type: EVENT_TYPE.SEND_VERIFICATION_EMAIL,
          payload: {
            email: data.email,
            token: data.token,
          },
        },
      });

      return user;
    });
  }

  async resendVerification(
    userId: string,
    email: string,
    verificationToken: string,
  ) {
    await this.prisma.$transaction(async (pr) => {
      await pr.userToken.create({
        data: {
          userId: userId,
          token: verificationToken,
          type: 'SEND_VERIFICATION_EMAIL',
          expiresAt: new Date(Date.now() + mintesToMilliseconds(15)),
        },
      });

      await pr.outbox.create({
        data: {
          event_type: EVENT_TYPE.SEND_VERIFICATION_EMAIL,
          payload: { email, token: verificationToken },
        },
      });
    });
  }

  async forgotPassword(data: { userId: string; token: string; email: string }) {
    await this.prisma.$transaction(async (pr) => {
      await pr.userToken.create({
        data: {
          userId: data.userId,
          token: data.token,
          type: 'SEND_RESET_PASSWORD',
          expiresAt: new Date(Date.now() + mintesToMilliseconds(15)),
        },
      });

      await pr.outbox.create({
        data: {
          event_type: EVENT_TYPE.SEND_RESET_PASSWORD,
          payload: { email: data.email, token: data.token },
        },
      });
    });
  }

  create(data: ICreateUser) {
    return this.prisma.user.create({ data });
  }

  updateProfile(id: string, data: IUpdateUser) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        first_name: true,
        last_name: true,
        phone: true,
        email: true,
        isVerified: true,
        isDelete: true,
        created_at: true,
        updated_at: true,
        profileImageUrl: true,
      },
    });
  }

  updatePassword(id: string, data: IUpdatePassword) {
    return this.prisma.user.update({ where: { id }, data });
  }

  updateRefreshToken(id: string, data: IUpdateRefreshToken) {
    return this.prisma.user.update({ where: { id }, data });
  }

  verifyEmail(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { isVerified: true },
    });
  }

  restoreAccount(email: string, data: IRestoreAccount) {
    return this.prisma.user.update({ where: { email }, data });
  }

  softDelete(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { isDelete: true, deleteAt: new Date(), refreshToken: null },
    });
  }

  updateProfileImage(id: string, url: string, publicId: string) {
    return this.prisma.user.update({
      where: { id },
      data: { profileImageUrl: url, profileImagePublicId: publicId },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        profileImageUrl: true,
      },
    });
  }

  // ==================== UserToken ====================

  findToken(token: string) {
    return this.prisma.userToken.findUnique({
      where: { token },
      include: { User: true },
    });
  }

  deleteTokenById(id: string) {
    return this.prisma.userToken.delete({ where: { id } });
  }

  deleteTokenByValue(token: string) {
    return this.prisma.userToken.delete({ where: { token } });
  }
}
