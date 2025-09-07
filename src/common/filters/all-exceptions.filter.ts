import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const reqId = uuidv4();

    let status: number;
    let message: any;

    // Handle HttpExceptions (including ValidationPipe errors)
    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (Array.isArray((res as any).message)) {
        // validation errors from ValidationPipe
        const validationErrors = (res as any).message;
        message = validationErrors.map((err: string) => err);
      } else {
        message = (res as any).message || exception.message;
      }
    } else {
      // fallback for unknown errors
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
    }

    // Flatten message array to comma-separated string if needed
    if (Array.isArray(message)) {
      message = message.join(', ');
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId: reqId,
    });
  }
}
