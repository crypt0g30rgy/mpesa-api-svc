import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse();
        const statusCode = response.statusCode;
        const request = ctx.getRequest();
        const reqId = uuidv4();

        return {
          success: true,
          statusCode,
          message: data?.message ?? 'Request successful',
          timeStamp: new Date().toISOString(),
          data: data?.data ?? data,
          path: request.url,
          requestId: reqId,
        };
      }),
    );
  }
}
