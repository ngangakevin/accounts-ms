import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ReactivateDTO {
  @IsString()
  @ApiProperty()
  accountNumber: string;
}
