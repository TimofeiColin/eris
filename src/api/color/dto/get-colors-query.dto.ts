import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

import { PaginationQueryDto } from '../../dto';
import { toNumber, trimString } from '../../utils';

export class GetColorsQueryDto extends PaginationQueryDto {
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
}
