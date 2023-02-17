import { AccountType } from 'src/enums/account-type.enum';
import { Currency } from 'src/enums/currency.enum';

export class CreateAccountDTO {
  ownerId: string;
  currency: Currency;
  accountType: AccountType;
}
