import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

import { PaginationQueryDto } from '../../dto';
import { trimString } from '../../utils';

export class GetBotResponsesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Case-insensitive part of the command',
    example: 'good',
  })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  command?: string;

  @ApiPropertyOptional({
    description: 'Case-insensitive part of any of the responses',
    example: 'sleep',
  })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  response?: string;
}
