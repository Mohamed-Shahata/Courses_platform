import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AUTH_MESSAGES } from '../constants/messages';
import { ConfigService } from '@nestjs/config';
import { AUTHORIZATION, BEARER, USER } from '../constants/variables';
import { JwtPayloadType } from '../types/jwtPayloadType';
import { ROLE } from 'generated/prisma/enums';
import { Reflector } from '@nestjs/core';
import { UserService } from 'src/modules/user/user.service';
@Injectable()
export class AuthRoleGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private reflector: Reflector,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles: ROLE = this.reflector.getAllAndOverride('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles || roles.length === 0) {
      throw new ForbiddenException(AUTH_MESSAGES.NO_ROLE_DEFINED);
    }

    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers[AUTHORIZATION];

    if (!authHeader) {
      throw new UnauthorizedException(
        AUTH_MESSAGES.AUTHORIZATION_HEADER_MISSING,
      );
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== BEARER || !token) {
      console.log(token);
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_TOKEN_FORMAT);
    }

    try {
      const payload: JwtPayloadType = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });
      const { data } = await this.userService.findUser(payload.id);

      if (!roles.includes(data.role)) {
        throw new ForbiddenException(AUTH_MESSAGES.NO_PERMISSION);
      }

      request[USER] = payload;

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_OR_EXPIRED_TOKEN);
    }
  }
}
