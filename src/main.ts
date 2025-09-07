import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TimingInterceptor } from './common/interceptors/timing.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('M-Pesa API')
    .setDescription(
      'API documentation for M-Pesa Daraja integration (B2C, C2B, Balance, Tokens, etc.)',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token', // name of the security scheme
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true }, // keeps token between refreshes
  });

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true, // automatically converts query strings to numbers
    }),
  );

  // Global interceptor (for success responses)
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Global exception filter (for errors)
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global REQ/RESP timing filter
  app.useGlobalInterceptors(new TimingInterceptor());

  await app.listen(process.env.PORT ?? 3005);
}
bootstrap();
