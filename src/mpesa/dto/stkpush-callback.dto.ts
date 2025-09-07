import { IsNotEmpty, IsString } from 'class-validator';

export class STKPushCallbackDto {
  @IsString()
  @IsNotEmpty()
  MerchantRequestID: string;

  @IsString()
  @IsNotEmpty()
  CheckoutRequestID: string;

  @IsString()
  @IsNotEmpty()
  ResultCode: string;

  @IsString()
  @IsNotEmpty()
  ResultDesc: string;

  // Optionally include other fields like CallbackMetadata if needed
}
