import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDefined, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateColorGroupDto {
  @ApiProperty({ description: 'Name of the new color group', example: 'Neon', maxLength: 100 })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsDefined({ message: 'name is required' })
  @MaxLength(100)
  @IsNotEmpty()
  @IsString()
  name!: string;
}
