import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayloadType } from 'src/shared/types/jwtPayloadType';
import { Request } from 'express';
import { CURRENT_USER } from 'src/shared/constants/variables';
export const CurrentUser = createParamDecorator(
  (data, context: ExecutionContext) => {
    const request: Request = context.switchToHttp().getRequest();

    const user = request[CURRENT_USER] as JwtPayloadType;

    return user;
  },
);
