import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { CURRENT_USER } from 'src/shared/constants/variables';
import { JwtPayloadType } from 'src/shared/types/jwtPayloadType';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const requset: Request = context.switchToHttp().getRequest();

    const [type, token] = requset.headers.authorization?.split(' ') ?? [];

    if (token && type === 'Bearer') {
      try {
        const payload: JwtPayloadType =
          await this.jwtService.verifyAsync(token);

        requset[CURRENT_USER] = payload;

        return true;
      } catch {
        throw new UnauthorizedException('Access denied, invalid token');
      }
    } else {
      throw new UnauthorizedException('Access denied, no token provided');
    }
  }
}
