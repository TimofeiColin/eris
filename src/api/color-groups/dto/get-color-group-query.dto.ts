import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class GetColorGroupQueryDto {
  @ApiProperty({ description: 'Exact group name, any case', example: 'red' })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsDefined({ message: 'name is required' })
  @IsNotEmpty()
  @IsString()
  name!: string;
}
