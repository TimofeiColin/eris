import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

import { toNumber, trimString } from '../../utils';

export class GetColorQueryDto {
  @ApiPropertyOptional({
    description: 'Id of the color. Send either id or name',
    example: 1,
  })
  @Transform(toNumber)
  @IsOptional()
  @Min(1)
  @IsInt()
  id?: number;

  @ApiPropertyOptional({
    description: 'Exact color name, any case. Send either id or name',
    example: 'crimson',
  })
  @Transform(trimString)
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name?: string;
}
