import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    return {
      success: true,
      statusCode: 200,
      message: 'Hello!',
      timestamp: new Date().toISOString(), // UTC ISO format
    };
  }

  getRoot(): object {
    return {
      success: true,
      statusCode: 200,
      message: 'Mpesa Payments Integration API v1',
      timestamp: new Date().toISOString(),
    };
  }
}
