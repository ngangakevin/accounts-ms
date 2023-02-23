import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FreezeTimeDTO {
  @IsString()
  @ApiProperty()
  accountNumber: string;

  @IsOptional()
  @ApiProperty({ required: false })
  days?: number;

  @IsOptional()
  @ApiProperty({ required: false })
  months?: number;

  @IsOptional()
  @ApiProperty({ required: false })
  years?: number;
}
