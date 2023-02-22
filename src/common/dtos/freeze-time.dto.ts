import { IsOptional, IsString } from 'class-validator';

export class FreezeTimeDTO {
  @IsString()
  accountNumber: string;

  @IsOptional()
  days?: number;

  @IsOptional()
  months?: number;

  @IsOptional()
  years?: number;
}
