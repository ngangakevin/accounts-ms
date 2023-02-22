import { IsNumber } from 'class-validator';

export class Tarrif {
  @IsNumber()
  deposit: number;

  @IsNumber()
  withdraw: number;

  @IsNumber()
  transfer: number;
}
