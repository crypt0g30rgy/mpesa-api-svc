import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MpesaModule } from './mpesa/mpesa.module';
import { ConfigModule } from '@nestjs/config';
import mpesaConfig from './config/mpesa.config';
import * as Joi from 'joi';
import { setupAxiosRequestLogger } from './common/interceptors/axios.interceptor.';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // <-- makes ConfigService available globally
      load: [mpesaConfig],
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'staging', 'production')
          .default('development'),

        NODE_PORT: Joi.number().default(3000),

        // M-Pesa
        // B2C
        MPESA_B2C_CONSUMER_KEY: Joi.string().required(),
        MPESA_B2C_CONSUMER_SECRET: Joi.string().required(),
        MPESA_INITIATOR_NAME: Joi.string().required(),
        MPESA_INITIATOR_PASSWORD: Joi.string().required(),
        MPESA_COMMAND_ID: Joi.string().required(),
        MPESA_SECURITY_CREDENTIAL: Joi.string().optional(), // optional

        // C2B
        MPESA_C2B_CONSUMER_KEY: Joi.string().required(),
        MPESA_C2B_CONSUMER_SECRET: Joi.string().required(),
        MPESA_C2B_SHORTCODE: Joi.string().required(),
        MPESA_PASSKEY: Joi.string().required(),

        // Callback URLs (must be valid URIs)
        MPESA_TIMEOUT_CALLBACK_URL: Joi.string().uri().required(),
        MPESA_RESULT_CALLBACK_URL: Joi.string().uri().required(),
        MPESA_STK_RESULT_CALLBACK_URL: Joi.string().uri().required(),

        // Env
        MPESA_ENV: Joi.string()
          .valid('sandbox', 'production')
          .default('sandbox'),
        MPESA_CERT_PROD: Joi.when('MPESA_ENV', {
          is: 'production',
          then: Joi.string().required(),
          otherwise: Joi.string().optional(),
        }),
        MPESA_CERT_SANDBOX: Joi.when('MPESA_ENV', {
          is: 'sandbox',
          then: Joi.string().required(),
          otherwise: Joi.string().optional(),
        }),
      }),
    }),
    MpesaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  onModuleInit() {
    setupAxiosRequestLogger(); // Enable logging for all Axios requests
  }
}
