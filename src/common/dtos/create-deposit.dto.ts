import { ITaarif } from '../interfaces/taarif.interface';

export class CreateDepositDTO {
  accountNumber: string;
  amount: number;
  currency: string;
  taarif: ITaarif;
}
