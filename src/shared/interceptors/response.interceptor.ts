import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpStatus,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

/**
 * Global response interceptor
 *
 * This interceptor automatically wraps all controller responses
 * into a unified JSON structure with the following fields:
 * - success: boolean, always true for successful responses
 * - status: HTTP status code (default 200 if not set)
 * - message: optional message from the controller
 * - data: the actual response data (or null if none)
 *
 * Example:
 * ```json
 * {
 *   "success": true,
 *   "status": 200,
 *   "message": "login successful",
 *   "data": { "accessToken": "..." }
 * }
 * ```
 *
 * @implements NestInterceptor
 */

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  /**
   * Intercepts the outgoing response and transforms it into
   * a unified JSON structure.
   *
   * @param context - Execution context provided by NestJS
   * @param next - CallHandler to proceed with request execution
   * @returns Observable<any> - an Observable emitting the transformed response
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => ({
        success: true,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        status: response.statusCode || HttpStatus.OK,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        message: data?.message || null,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        data: data?.data || null,
      })),
    );
  }
}
