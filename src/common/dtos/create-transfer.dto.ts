import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';
import { ValidateNested } from '../decorators';
import { CreateDepositDTO } from './create-deposit.dto';

export class CreateTransferDTO {
  @IsObject()
  @ApiProperty({ required: true, type: CreateDepositDTO })
  @ValidateNested(CreateDepositDTO)
  from: CreateDepositDTO;

  @IsObject()
  @ApiProperty({ required: true, type: CreateDepositDTO })
  @ValidateNested(CreateDepositDTO)
  to: CreateDepositDTO;

  @IsString()
  @ApiProperty()
  channel: string;
}
