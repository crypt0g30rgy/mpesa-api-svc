import { IsNotEmpty, IsString, IsArray } from 'class-validator';

export class B2BCallbackDto {
  @IsString()
  @IsNotEmpty()
  TransactionID: string;

  @IsString()
  @IsNotEmpty()
  ResultCode: string;

  @IsString()
  @IsNotEmpty()
  ResultDesc: string;

  @IsArray()
  ResultParameters: any[];
}
