import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { USER } from '../constants/variables';
import { Request } from 'express';

/**
 * Parameter decorator that extracts the currently authenticated user
 * (or a specific field from it) from the incoming HTTP request.
 *
 * The user object is attached to the request by `JwtAuthGuard` after
 * successful JWT verification.
 *
 * @param data - An optional key of the user object to extract a specific field.
 *               If omitted, the entire user object is returned.
 *
 * @example
 * // Extract the full user object
 * @Get('profile')
 * getProfile(@CurrentUser() user: JwtPayloadType) { ... }
 *
 * @example
 * // Extract only the user's ID
 * @Get('profile')
 * getProfile(@CurrentUser('id') id: string) { ... }
 *
 * @example
 * // Extract the user's role
 * @Get('dashboard')
 * getDashboard(@CurrentUser('role') role: ROLE) { ... }
 */
export const CurrentUser = createParamDecorator(
  (data: keyof any, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    const user = request[USER];

    return data ? user?.[data] : user;
  },
);