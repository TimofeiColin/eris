import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

import { PaginationQueryDto } from '../../dto';
import { trimString } from '../../utils';

export class GetColorGroupsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Case-insensitive part of the group name',
    example: 'red',
  })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  name?: string;
}
