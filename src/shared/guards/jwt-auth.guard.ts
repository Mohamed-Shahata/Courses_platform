import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AUTH_MESSAGES } from '../constants/messages';
import { ConfigService } from '@nestjs/config';
import { AUTHORIZATION, BEARER, USER } from '../constants/variables';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService,private configService:ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers[AUTHORIZATION];

    if (!authHeader) {
      throw new UnauthorizedException(AUTH_MESSAGES.AUTHORIZATION_HEADER_MISSING);
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== BEARER || !token) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_TOKEN_FORMAT);
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>("JWT_ACCESS_SECRET"),
      });

      request[USER] = {
        id: String(payload.id)
      };

      return true;
    } catch (err) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_OR_EXPIRED_TOKEN);
    }
  }
}