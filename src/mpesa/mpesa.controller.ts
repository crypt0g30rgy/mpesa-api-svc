import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  Query,
} from '@nestjs/common';
import { MpesaService } from './mpesa.service';
import { B2CTransactionDto } from './dto/create-mpesa-b2c.dto';
import { STKPushCallbackDto } from './dto/stkpush-callback.dto';
import { B2BCallbackDto } from './dto/b2b-callback.dto';
import { B2CCallbackDto } from './dto/b2c-callback.dto';

import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { STKPushDto } from './dto/stkpush.dto';

@ApiTags('M-Pesa') // Groups all endpoints under "M-Pesa" in Swagger
@Controller('mpesa')
export class MpesaController {
  private readonly logger = new Logger(MpesaController.name);

  constructor(private readonly mpesaService: MpesaService) {}

  // debug purposes
  @Get('access-token')
  @ApiQuery({ name: 'app', enum: ['c2b', 'b2c'], required: true })
  @ApiOperation({
    summary: 'Generate Access Token',
    description: 'Generates an OAuth access token for M-Pesa API requests.',
  })
  @ApiResponse({
    status: 200,
    description: 'Access token generated successfully.',
  })
  async getAccessToken(@Query('app') app: 'c2b' | 'b2c' = 'b2c') {
    const token = await this.mpesaService.createAccessToken(app);
    return { app, access_token: token };
  }

  @Get('security-credentials')
  @ApiOperation({
    summary: 'Generate Security Credentials',
    description:
      'Encrypts initiator password using Safaricom’s public certificate.',
  })
  @ApiResponse({
    status: 200,
    description: 'Security credentials generated successfully.',
  })
  createSecurityCredentials() {
    return this.mpesaService.createSecurityCredentials();
  }

  @Post('init-b2c')
  @ApiOperation({
    summary: 'Initiate B2C Transaction',
    description: 'Initiates a Business-to-Customer (B2C) transaction.',
  })
  @ApiQuery({
    name: 'hardcoded',
    required: false,
    description:
      'If true, uses hardcoded security credentials instead of generating dynamically.',
  })
  @ApiBody({
    schema: {
      example: {
        amount: 1000,
        phoneNumber: '254712345678',
        remarks: 'Payout for order #123',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'B2C transaction initiated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request or missing parameters.',
  })
  async b2cTransaction(
    @Body() dto: B2CTransactionDto,
    @Query('hardcoded') hardcoded?: string,
  ) {
    const useHardcoded = hardcoded === 'true';
    return await this.mpesaService.createB2CTransaction(
      dto.amount,
      dto.phoneNumber,
      dto.remarks,
      useHardcoded,
    );
  }

  @Post('stkpush')
  @ApiOperation({
    summary: 'Initiate STK Push',
    description: 'Initiates a customer STK Push payment.',
  })
  @ApiBody({
    schema: {
      example: {
        phoneNumber: '254712345678',
        amount: 500,
        transactionDesc: 'Order payment #123',
        accountReference: 'Invoice123',
      },
    },
  })
  async stkPush(@Body() dto: STKPushDto) {
    return await this.mpesaService.initiateSTKPush(dto);
  }

  @Get('account-balance')
  @ApiOperation({
    summary: 'Query Account Balance',
    description: 'Checks the balance of an M-Pesa shortcode account.',
  })
  @ApiQuery({
    name: 'hardcoded',
    required: false,
    description: 'If true, uses hardcoded security credentials.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Account balance query submitted. Actual balance is returned asynchronously via callback.',
  })
  async accountBalance(@Query('hardcoded') hardcoded?: string) {
    const useHardcoded = hardcoded === 'true';
    return await this.mpesaService.queryAccountBalance(useHardcoded);
  }

  @Post('callback/result')
  @ApiOperation({
    summary: 'Callback (Safaricom)',
    description: 'Safaricom sends transaction results to this endpoint.',
  })
  @ApiBody({
    schema: {
      example: {
        Result: {
          ResultType: 0,
          ResultCode: 0,
          ResultDesc: 'The service request is processed successfully.',
          TransactionID: 'LK451H35OP',
          ConversationID: 'AG_20230904_123456789',
          OriginatorConversationID: '12345-67890-1',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Callback received successfully.' })
  async b2cCallback(@Body() body: any) {
    const result = body.Result;

    // Log the callback
    this.logger.log('Received callback: ' + JSON.stringify(result));

    // Check ResultCode
    if (result.ResultCode === 0) {
      this.logger.log(`Transaction ${result.TransactionID} succeeded`);
    } else {
      this.logger.error(
        `Transaction ${result.TransactionID} failed: ${result.ResultDesc}`,
      );
    }

    // Respond to Safaricom
    return { ResultCode: 0, ResultDesc: 'Received successfully' };
  }

  @Post('callback/stk/result')
  @ApiOperation({
    summary: 'STK Push Callback (Safaricom)',
    description:
      'Safaricom sends STK Push transaction results to this endpoint.',
  })
  @ApiBody({
    schema: {
      example: {
        Body: {
          stkCallback: {
            MerchantRequestID: 'f5f3-4116-aa74-517666b8dd3338758',
            CheckoutRequestID: 'ws_CO_030920252304385708374149',
            ResultCode: 0,
            ResultDesc: 'The service request is processed successfully.',
            CallbackMetadata: {
              Item: [
                { Name: 'Amount', Value: 500 },
                { Name: 'MpesaReceiptNumber', Value: 'LK451H35OP' },
                { Name: 'TransactionDate', Value: 20250903123045 },
                { Name: 'PhoneNumber', Value: '254712345678' },
              ],
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Callback received successfully.' })
  async stkCallback(@Body() body: any) {
    const callback = body?.Body?.stkCallback;

    if (!callback) {
      this.logger.error('Invalid STK Push callback payload', body);
      return { ResultCode: 1, ResultDesc: 'Invalid payload' };
    }

    this.logger.log('Received STK Push callback: ' + JSON.stringify(callback));

    if (callback.ResultCode === 0) {
      const receipt = callback.CallbackMetadata?.Item?.find(
        (i) => i.Name === 'MpesaReceiptNumber',
      )?.Value;
      const amount = callback.CallbackMetadata?.Item?.find(
        (i) => i.Name === 'Amount',
      )?.Value;
      this.logger.log(`STK Push ${receipt} succeeded for amount ${amount}`);
      // TODO: Mark transaction as SUCCESS in DB
    } else {
      this.logger.error(`STK Push failed: ${callback.ResultDesc}`);
      // TODO: Mark transaction as FAILED in DB
    }

    // Respond to Safaricom
    return { ResultCode: 0, ResultDesc: 'Received successfully' };
  }

  @Post('b2b')
  async b2bTransaction(@Body() any) {
    return await this.mpesaService.createB2BTransaction();
  }

  @Post('c2b')
  async c2bPayment(@Body() any) {
    return await this.mpesaService.registerC2BTransaction();
  }
}
