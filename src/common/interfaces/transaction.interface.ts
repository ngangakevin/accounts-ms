import { Accounts } from '@entities';
import { Currency, TransactionType } from '@enums';

export interface ITransaction {
  transactionTime: string;
  channel: string;
  beneficiary: string | Accounts;
  fundsSource: string;
  amount: number;
  transaction: Currency;
  transactionType: TransactionType;
  creditCharge: number;
  debitCharge: number;
}
