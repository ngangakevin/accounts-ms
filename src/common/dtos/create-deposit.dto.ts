import { ITaarif } from '@common';

export class CreateDepositDTO {
  accountNumber: string;
  amount: number;
  currency: string;
  taarif: ITaarif;
}
