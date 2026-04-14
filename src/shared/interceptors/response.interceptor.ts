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
 * Global HTTP response interceptor that wraps all controller responses
 * into a unified JSON envelope.
 *
 * Applied globally in `main.ts` via `app.useGlobalInterceptors()`.
 *
 * @remarks
 * Every successful response from any controller will be transformed into:
 * ```json
 * {
 *   "success": true,
 *   "status": 200,
 *   "message": "operation message or null",
 *   "data": { ... } or null
 * }
 * ```
 *
 * Controllers should return objects with optional `message` and `data` keys.
 * Any other keys will be ignored by this interceptor.
 *
 * @example
 * // Controller returns:
 * return { message: 'Login successful', data: { accessToken: '...' } };
 *
 * // Interceptor transforms it to:
 * {
 *   success: true,
 *   status: 200,
 *   message: 'Login successful',
 *   data: { accessToken: '...' }
 * }
 *
 * @implements {NestInterceptor}
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  /**
   * Intercepts the outgoing response and wraps it in a unified structure.
   *
   * @param context - The NestJS execution context providing access to the HTTP response.
   * @param next - The call handler that proceeds with the request execution pipeline.
   * @returns An Observable emitting the transformed, unified response object.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        if (!data || response.headersSent) {
          return data;
        }
        return {
          success: true,
          status: response.statusCode || HttpStatus.OK,
          message: data?.message || null,
          data: data?.data || null,
        };
      }),
    );
  }
}
