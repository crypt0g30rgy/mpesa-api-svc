import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import axios from 'axios';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { STKPushDto } from './dto/stkpush.dto';

type MpesaAppType = 'c2b' | 'b2c';

@Injectable()
export class MpesaService {
  private baseUrl: string;
  private certPath: string;

  private timeoutUrl: string;
  private resultUrl: string;
  private stkresultUrl: string;

  private b2cConsumerKey: string;
  private b2cConsumerSecret: string;
  private initiatorName: string;
  private initiatorPassword: string;
  private b2cShortCode: string;
  private commandId: string;
  private hardCodedCreds: string;

  private c2bConsumerKey: string;
  private c2bConsumerSecret: string;
  private passKey: string;
  private c2bShortCode: string;

  constructor(private configService: ConfigService) {
    const mpesaConfig = this.configService.get('mpesa');

    console.log(mpesaConfig);

    this.baseUrl = mpesaConfig.baseUrl;
    this.certPath = mpesaConfig.certPath;

    this.timeoutUrl = mpesaConfig.timeoutUrl;
    this.resultUrl = mpesaConfig.resultUrl;
    this.stkresultUrl = mpesaConfig.stkResultUrl;

    this.b2cConsumerKey = mpesaConfig.b2cConsumerKey;
    this.b2cConsumerSecret = mpesaConfig.b2cConsumerSecret;
    this.initiatorName = mpesaConfig.initiatorName;
    this.initiatorPassword = mpesaConfig.initiatorPassword;
    this.commandId = mpesaConfig.commandId;
    this.b2cShortCode = mpesaConfig.b2cShortCode;
    this.hardCodedCreds = mpesaConfig.hardCodedCreds;

    this.c2bConsumerKey = mpesaConfig.c2bConsumerKey;
    this.c2bConsumerSecret = mpesaConfig.c2bConsumerSecret;
    this.c2bShortCode = mpesaConfig.c2bShortCode;
    this.passKey = mpesaConfig.passKey;
  }

  // Fetch Access Token
  async createAccessToken(app: MpesaAppType = 'b2c'): Promise<string> {
    const consumerKey =
      app === 'c2b' ? this.c2bConsumerKey : this.b2cConsumerKey;
    const consumerSecret =
      app === 'c2b' ? this.c2bConsumerSecret : this.b2cConsumerSecret;

    console.log(app);
    console.log(consumerKey);

    if (!consumerKey || !consumerSecret) {
      throw new Error(`Missing credentials for ${app.toUpperCase()}`);
    }

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
      'base64',
    );

    console.log(auth);
    console.log(this.baseUrl);

    try {
      const response = await axios.get(
        `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: { Authorization: `Basic ${auth}` },
        },
      );

      return response.data.access_token;
    } catch (error) {
      console.error(
        `Error generating ${app.toUpperCase()} access token:`,
        error.response?.data || error.message,
        error.response?.status,
        error.response?.headers,
      );
      throw new Error(
        `Failed to generate ${app.toUpperCase()} M-Pesa access token`,
      );
    }
  }
  // Generate Security Credentials
  createSecurityCredentials() {
    try {
      // Load certificate
      const certificate = fs.readFileSync(this.certPath, 'utf8');

      console.log(certificate);

      // Encrypt initiator password
      // Encrypt using RSA_PKCS1_PADDING
      const encrypted = crypto.publicEncrypt(
        {
          key: certificate,
          padding: crypto.constants.RSA_PKCS1_PADDING,
        },
        Buffer.from(this.initiatorPassword, 'utf8'),
      );

      // Base64 encode
      const securityCredentials = encrypted.toString('base64');

      return securityCredentials;
    } catch (error) {
      console.error('Error generating security credentials:', error);
      throw new Error('Failed to generate M-Pesa security credentials');
    }
  }

  // Initiate B2C Transaction
  async createB2CTransaction(
    amount: number,
    phoneNumber: string,
    remarks: string,
    useHardcoded: boolean = false, // new parameter
  ): Promise<any> {
    const tokenB2C = await this.createAccessToken('b2c');

    // Use hardcoded security credential or generate dynamically
    const securityCredentials = useHardcoded
      ? this.hardCodedCreds
      : this.createSecurityCredentials();

    const payload = {
      InitiatorName: this.initiatorName,
      SecurityCredential: securityCredentials,
      CommandID: this.commandId, // e.g., BusinessPayment
      Amount: amount,
      PartyA: this.b2cShortCode,
      PartyB: phoneNumber,
      Remarks: remarks,
      QueueTimeOutURL: this.timeoutUrl,
      ResultURL: this.resultUrl,
      Occasion: 'Payment',
    };

    console.log('Initiator Password:', this.initiatorPassword);
    console.log('Payload:', payload);

    try {
      const response = await axios.post(
        `${this.baseUrl}/mpesa/b2c/v1/paymentrequest`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${tokenB2C}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        },
      );

      return response.data;
    } catch (error) {
      console.error(
        'Error initiating B2C transaction:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to initiate B2C transaction');
    }
  }

  // get Balances
  async queryAccountBalance(
    useHardcoded: boolean = false, // optional toggle
  ): Promise<any> {
    const tokenB2C = await this.createAccessToken('b2c');

    // Use hardcoded credential or generate dynamically
    const securityCredentials = useHardcoded
      ? this.configService.get<string>('MPESA_SECURITY_CREDENTIAL')!
      : this.createSecurityCredentials();

    const payload = {
      Initiator: this.initiatorName,
      SecurityCredential: securityCredentials,
      CommandID: 'AccountBalance',
      PartyA: this.b2cShortCode, // your business shortcode
      IdentifierType: '4', // '4' usually denotes organization/shortcode
      Remarks: 'Account Balance Check',
      QueueTimeOutURL: this.timeoutUrl,
      ResultURL: this.resultUrl,
    };

    console.log('Account Balance Payload:', payload);

    try {
      const response = await axios.post(
        `${this.baseUrl}/mpesa/accountbalance/v1/query`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${tokenB2C}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        },
      );

      console.log(response.data);

      return response.data;
    } catch (error) {
      console.error(
        'Error querying account balance:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to query account balance');
    }
  }

  // STK Push
  async initiateSTKPush(dto: STKPushDto): Promise<any> {
    const tokenC2B = await this.createAccessToken('c2b');
    const payload = {
      BusinessShortCode: this.c2bShortCode,
      Password: this.generateSTKPassword(),
      Timestamp: this.getTimestamp(),
      TransactionType: 'CustomerPayBillOnline',
      Amount: dto.amount,
      PartyA: dto.phoneNumber,
      PartyB: this.c2bShortCode,
      PhoneNumber: dto.phoneNumber,
      CallBackURL: this.stkresultUrl,
      AccountReference: dto.accountReference,
      TransactionDesc: dto.transactionDesc,
    };

    const response = await axios.post(
      `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
      payload,
      {
        headers: { Authorization: `Bearer ${tokenC2B}` },
      },
    );

    return response.data;
  }

  // Helper for STK Push
  private getTimestamp(): string {
    const date = new Date();
    return `${date.getFullYear()}${('0' + (date.getMonth() + 1)).slice(-2)}${('0' + date.getDate()).slice(-2)}${('0' + date.getHours()).slice(-2)}${('0' + date.getMinutes()).slice(-2)}${('0' + date.getSeconds()).slice(-2)}`;
  }

  private generateSTKPassword(): string {
    const passkey = this.passKey;
    const timestamp = this.getTimestamp();
    const data = this.c2bShortCode + passkey + timestamp;
    return Buffer.from(data).toString('base64');
  }

  registerC2BTransaction() {
    return 'This endpoint intiates a C2B transaction';
  }

  createB2BTransaction() {
    return 'This endpoint intiates a B2B transaction';
  }
}
