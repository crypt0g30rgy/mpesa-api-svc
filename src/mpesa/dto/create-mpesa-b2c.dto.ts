import { IsNotEmpty, IsNumber, IsString, Matches } from 'class-validator';

export class B2CTransactionDto {
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
  remarks: string;
}
