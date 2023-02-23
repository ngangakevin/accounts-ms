import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { AccountType } from 'src/enums/account-type.enum';
import { Currency } from 'src/enums/currency.enum';

export class CreateAccountDTO {
  @ApiProperty()
  @IsString()
  ownerId: string;

  @ApiProperty({ enum: Currency, enumName: 'currency' })
  @IsEnum(Currency)
  currency: Currency;

  @ApiProperty({ enum: AccountType, enumName: 'accountType' })
  @IsEnum(AccountType)
  accountType: AccountType;
}
