import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class B2BTransactionDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^600\d{3}$/, {
    message: 'partyA must be a valid business shortcode',
  })
  partyA: string; // your business shortcode

  @IsString()
  @IsNotEmpty()
  @Matches(/^600\d{3}$/, {
    message: 'partyB must be a valid business shortcode',
  })
  partyB: string; // receiving business shortcode

  @IsString()
  @IsNotEmpty()
  remarks: string;

  @IsString()
  @IsOptional()
  occasion?: string;
}
