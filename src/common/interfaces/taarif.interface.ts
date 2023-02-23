import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class Tarrif {
  @ApiProperty({ default: 0.01 })
  @IsNumber()
  deposit: number;

  @ApiProperty({ default: 0.01 })
  @IsNumber()
  withdraw: number;

  @ApiProperty({ default: 0.01 })
  @IsNumber()
  transfer: number;
}
