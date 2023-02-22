import { Type } from 'class-transformer';
import { IsString } from 'class-validator';
import { CreateDepositDTO } from './create-deposit.dto';

export class CreateTransferDTO {
  @Type(() => CreateDepositDTO)
  from: CreateDepositDTO;

  @Type(() => CreateDepositDTO)
  to: CreateDepositDTO;

  @IsString()
  channel: string;
}
