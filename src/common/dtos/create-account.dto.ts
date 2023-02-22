import { IsEnum, IsString } from 'class-validator';
import { AccountType } from 'src/enums/account-type.enum';
import { Currency } from 'src/enums/currency.enum';

export class CreateAccountDTO {
  @IsString()
  ownerId: string;

  @IsEnum(Currency)
  currency: Currency;

  @IsEnum(AccountType)
  accountType: AccountType;
}
