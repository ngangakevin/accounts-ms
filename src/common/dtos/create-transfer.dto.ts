import { CreateDepositDTO } from './create-deposit.dto';

export class CreateTransferDTO {
  from: CreateDepositDTO;
  to: CreateDepositDTO;
}
