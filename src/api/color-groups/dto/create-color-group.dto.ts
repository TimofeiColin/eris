import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDefined, IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { trimString } from '../../utils';

export class CreateColorGroupDto {
  @ApiProperty({
    description: 'Name of the new color group',
    example: 'Neon',
    maxLength: 100,
  })
  @Transform(trimString)
  @IsDefined({ message: 'name is required' })
  @MaxLength(100)
  @IsNotEmpty()
  @IsString()
  name!: string;
}
