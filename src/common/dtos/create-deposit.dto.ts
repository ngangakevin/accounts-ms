import { Tarrif } from '@common';
import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty()
  accountNumber: string;

  @IsNumber()
  // TODO Change this to a constant stored in redis
  @Min(10)
  @ApiProperty({ type: Number, minimum: 10 })
  amount: number;

  @IsEnum(Currency)
  @ApiProperty({ enum: Currency, enumName: 'currency' })
  currency: Currency;

  @IsObject()
  @ApiProperty({ type: () => Tarrif })
  @Type(() => Tarrif)
  tarrif: Tarrif;

  @IsString()
  @ApiProperty()
  channel: string;
}
