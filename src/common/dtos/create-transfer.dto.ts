import { IsObject, IsString } from 'class-validator';
import { ValidateNested } from '../decorators';
import { CreateDepositDTO } from './create-deposit.dto';

export class CreateTransferDTO {
  @IsObject()
  @ValidateNested(CreateDepositDTO)
  from: CreateDepositDTO;

  @IsObject()
  @ValidateNested(CreateDepositDTO)
  to: CreateDepositDTO;

  @IsString()
  channel: string;
}
