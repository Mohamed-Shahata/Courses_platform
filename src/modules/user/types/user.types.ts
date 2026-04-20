import { RoleUser } from '../../../shared/enums/RoleUser.enum';

// ========== User ==========

export interface ICreateUser {
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  phone: string;
  role: RoleUser;
}

export interface IUpdateUser {
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface IUpdatePassword {
  password_hash: string;
}

export interface IUpdateRefreshToken {
  refreshToken: string | null;
}

export interface IRestoreAccount {
  isDelete: boolean;
  deleteAt: Date | null;
}

export interface IUpdateRole {
  role: RoleUser;
}

// ========== UserToken ==========

export interface ICreateUserToken {
  userId: string;
  token: string;
  type: string;
  expiresAt: Date;
}
