import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { USER } from '../constants/variables';

export const CurrentUser = createParamDecorator(
  (data: keyof any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request[USER];
    return data ? user?.[data] : user;
  },
);