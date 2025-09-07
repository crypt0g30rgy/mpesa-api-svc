import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class TimingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now(); // start time
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    return next.handle().pipe(
      tap(() => {
        const elapsed = Date.now() - now;
        // Attach elapsed time to response headers
        response.setHeader('X-Request-Response-Time', `${elapsed}ms`);
        // Optionally log to console
        console.log(
          `[${context.getClass().name}] ${context.getHandler().name} executed in ${elapsed}ms`,
        );
      }),
    );
  }
}
