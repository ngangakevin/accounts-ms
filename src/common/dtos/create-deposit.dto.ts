import { Tarrif } from '@common';
import { Type } from 'class-transformer';
import {
  Contains,
  IsEnum,
  IsNumber,
  IsObject,
  IsString,
  Min,
} from 'class-validator';
import { Currency } from 'src/enums';

export class CreateDepositDTO {
  @IsString()
  @Contains('qb')
  accountNumber: string;

  @IsNumber()
  // TODO Change this to a constant stored in redis
  @Min(10)
  amount: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsObject()
  @Type(() => Tarrif)
  tarrif: Tarrif;

  @IsString()
  channel: string;
}
