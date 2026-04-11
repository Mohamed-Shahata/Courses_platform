import { RoleUser } from 'src/shared/enums/RoleUser.enum';

// ========== User ==========

export interface ICreateUser {
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  phone: string;
  role: RoleUser;
}

export interface ICreateUserWithVerification {
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  role: RoleUser;
  phone: string;
  token: string;
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

// ========== UserToken ==========

export interface ICreateUserToken {
  userId: string;
  token: string;
  type: string;
  expiresAt: Date;
}
