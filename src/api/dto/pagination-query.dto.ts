import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

import { toNumber } from '../utils';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Page number, from 1 to 100',
    example: 1,
    default: 1,
    minimum: 1,
    maximum: 100,
  })
  @Transform(toNumber)
  @IsOptional()
  @Max(100)
  @Min(1)
  @IsInt()
  page: number = 1;
}
