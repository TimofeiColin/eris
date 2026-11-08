import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

import { toNumber, trimString } from '../utils';

export class IdOrNameQueryDto {
  @ApiPropertyOptional({
    description: 'Id to look up. Send either id or name',
    example: 1,
  })
  @Transform(toNumber)
  @IsOptional()
  @Min(1)
  @IsInt()
  id?: number;

  @ApiPropertyOptional({
    description: 'Exact name to look up, any case. Send either id or name',
    example: 'red',
  })
  @Transform(trimString)
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name?: string;
}
