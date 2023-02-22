import { IsString } from 'class-validator';

export class ReactivateDTO {
  @IsString()
  accountNumber: string;
}
