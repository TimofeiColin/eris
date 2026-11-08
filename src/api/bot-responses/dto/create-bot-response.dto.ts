import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsDefined, IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { trimString, trimStrings } from '../../utils';

export class CreateBotResponseDto {
  @ApiProperty({
    description: 'Message the bot replies to, matched in any case',
    example: 'good morning',
    maxLength: 200,
  })
  @Transform(trimString)
  @IsDefined({ message: 'command is required' })
  @MaxLength(200)
  @IsNotEmpty()
  @IsString()
  command!: string;

  @ApiProperty({
    description: 'Replies the bot picks from, each up to 2000 characters',
    example: ['Good morning! ☀️', 'Rise and shine!'],
    type: [String],
    maxItems: 50,
  })
  @Transform(trimStrings)
  @IsDefined({ message: 'responses is required' })
  @MaxLength(2000, { each: true })
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  @ArrayMaxSize(50)
  @ArrayNotEmpty()
  @IsArray()
  responses!: string[];
}
