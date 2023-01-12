import { Accounts } from '@entities';

export interface ITransaction {
  transactionTime: string;
  channel: string;
  beneficiary: string | Accounts;
  fundsSource: string;
  amount: number;
}
