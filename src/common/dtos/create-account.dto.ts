import { AccountType } from 'src/enums/accountType.enum';
import { Currency } from 'src/enums/currency.enum';

export class CreateAccountDTO {
  ownerId: string;
  currency: Currency;
  accountType: AccountType;
}
