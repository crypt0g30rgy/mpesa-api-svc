import { IsNotEmpty, IsString, IsArray } from 'class-validator';

export class B2CCallbackDto {
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
  ResultParameters: any[]; // Optional: capture details like Amount, ReceiverParty
}
