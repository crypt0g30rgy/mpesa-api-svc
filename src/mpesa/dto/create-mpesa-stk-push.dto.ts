import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  IsOptional,
} from 'class-validator';

export class STKPushDto {
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
  accountReference: string;

  @IsString()
  @IsNotEmpty()
  transactionDesc: string;

  @IsString()
  @IsOptional()
  callbackURL?: string; // optional if default is configured
}
