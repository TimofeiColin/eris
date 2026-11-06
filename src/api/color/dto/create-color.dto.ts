import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDefined, IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

import { IsHex, toNumber, trimString, trimUpperCase } from '../../utils';

export class CreateColorDto {
  @ApiProperty({
    description: 'Name of the color, also used for its Discord role',
    example: 'Neon Green',
    maxLength: 90,
  })
  @Transform(trimString)
  @IsDefined({ message: 'name is required' })
  @MaxLength(90)
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'Hex code like #39FF14, any case, saved in uppercase',
    example: '#39FF14',
    pattern: '^#[0-9A-Fa-f]{6}$',
  })
  @Transform(trimUpperCase)
  @IsDefined({ message: 'hex is required' })
  @IsHex()
  @IsString()
  hex!: string;

  @ApiProperty({
    description: 'Id of the color group the color belongs to',
    example: 4,
  })
  @Transform(toNumber)
  @IsDefined({ message: 'groupId is required' })
  @Min(1)
  @IsInt()
  groupId!: number;
}
