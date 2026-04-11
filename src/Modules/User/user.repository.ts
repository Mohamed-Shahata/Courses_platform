import { Injectable } from '@nestjs/common';
import { DataBaseService } from '../db/database.service';
import {
  ICreateUser,
  IUpdateUser,
  IUpdatePassword,
  IUpdateRefreshToken,
  IRestoreAccount,
  ICreateUserToken,
} from './types/user.types';
import { ROLE } from '@prisma/client';

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

  // findTokenByUserAndType(userId: string, type: string) {
  //   return this.prisma.userToken.findUnique({
  //     where: { userId_type: { userId, type } },
  //   });
  // }

  // createToken(data: ICreateUserToken) {
  //   return this.prisma.userToken.create({ data });
  // }

  deleteTokenById(id: string) {
    return this.prisma.userToken.delete({ where: { id } });
  }

  deleteTokenByValue(token: string) {
    return this.prisma.userToken.delete({ where: { token } });
  }
}
