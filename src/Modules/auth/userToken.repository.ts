import { Injectable } from '@nestjs/common';
import { DataBaseService } from '../db/database.service';
import { EVENT_TYPE } from '@prisma/client';
import {
  ICreateUserToken,
  IFindByUserIdAndType,
} from './types/userToken.types';

@Injectable()
export class UserTokenRepository {
  constructor(private prisma: DataBaseService) {}

  create(data: ICreateUserToken) {
    return this.prisma.userToken.create({ data });
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

  deleteById(id: string) {
    return this.prisma.userToken.delete({ where: { id } });
  }

  deleteByToken(token: string) {
    return this.prisma.userToken.delete({ where: { token } });
  }
}
