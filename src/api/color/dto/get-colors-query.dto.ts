import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

import { toNumber, trimString } from '../../utils';

export class GetColorsQueryDto {
  @ApiPropertyOptional({
    description: 'Case-insensitive part of the color name',
    example: 'red',
  })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Only colors from this color group',
    example: 1,
  })
  @Transform(toNumber)
  @IsOptional()
  @Min(1)
  @IsInt()
  groupId?: number;

  @ApiPropertyOptional({
    description: 'Page number, from 1 to 100',
    example: 1,
    default: 1,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @Max(100)
  @Min(1)
  @IsInt()
  page: number = 1;
}
