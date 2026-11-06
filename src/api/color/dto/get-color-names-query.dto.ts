import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDefined, IsInt, Min } from 'class-validator';

import { toNumber } from '../../utils';

export class GetColorNamesQueryDto {
  @ApiProperty({
    description: 'Id of the color group',
    example: 1,
  })
  @Transform(toNumber)
  @IsDefined({ message: 'groupId is required' })
  @Min(1)
  @IsInt()
  groupId!: number;
}
