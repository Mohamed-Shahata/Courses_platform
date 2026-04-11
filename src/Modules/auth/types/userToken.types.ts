import { EVENT_TYPE } from '@prisma/client';

export interface ICreateUserToken {
  userId: string;
  token: string;
  type: EVENT_TYPE;
  expiresAt: Date;
}

export interface IFindByUserIdAndType {
  userId: string;
  type: EVENT_TYPE;
}
