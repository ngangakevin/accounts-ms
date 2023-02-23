import { IsNotEmptyObject, IsString } from 'class-validator';
import { ValidateNested } from '../decorators';
import { CreateDepositDTO } from './create-deposit.dto';

export class CreateTransferDTO {
  @IsNotEmptyObject()
  @ValidateNested(CreateDepositDTO)
  from: CreateDepositDTO;

  @IsNotEmptyObject()
  @ValidateNested(CreateDepositDTO)
  to: CreateDepositDTO;

  @IsString()
  channel: string;
}
