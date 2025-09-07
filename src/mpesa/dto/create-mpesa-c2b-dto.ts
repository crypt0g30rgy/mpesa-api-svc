import { IsNotEmpty, IsNumber, IsString, Matches } from 'class-validator';

export class C2BPaymentDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^254\d{9}$/, {
    message: 'phoneNumber must be in format 2547XXXXXXXX',
  })
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  billRefNumber: string;
}
