import { Injectable } from '@nestjs/common';
import { DataBaseService } from '../db/database.service';
import {
  ICreateUserToken,
  IFindByUserIdAndType,
} from './types/userToken.types';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserTokenRepository {
  constructor(private prisma: DataBaseService) {}

  create(data: ICreateUserToken, tx: Prisma.TransactionClient) {
    return tx.userToken.create({
      data: {
        token: data.token,
        type: data.type,
        expiresAt: data.expiresAt,

        User: {
          connect: {
            id: data.userId,
          },
        },
      },
    });
  }

  findByToken(token: string) {
    return this.prisma.userToken.findUnique({ where: { token } });
  }

  findByUserIdAndType(data: IFindByUserIdAndType) {
    return this.prisma.userToken.findUnique({
      where: {
        userId_type: {
          userId: data.userId,
          type: data.type,
        },
      },
    });
  }

  deleteById(id: string, tx: Prisma.TransactionClient) {
    return tx.userToken.delete({ where: { id } });
  }

  deleteByToken(token: string) {
    return this.prisma.userToken.delete({ where: { token } });
  }
}
