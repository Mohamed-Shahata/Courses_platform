import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { USER } from '../constants/variables';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (data: keyof any, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    const user = request[USER];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return data ? user?.[data] : user;
  },
);
