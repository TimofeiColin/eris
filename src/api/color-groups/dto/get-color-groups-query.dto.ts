import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class GetColorGroupsQueryDto {
  @ApiPropertyOptional({
    description: 'Case-insensitive part of the group name',
    example: 'red',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Page number, from 1 to 100', example: 1, default: 1, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @Max(100)
  @Min(1)
  @IsInt()
  page: number = 1;
}
