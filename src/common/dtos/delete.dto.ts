import { IsString } from 'class-validator';

export class DeleteDTO {
  @IsString()
  accountNumber: string;
}
