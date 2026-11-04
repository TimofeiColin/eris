import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDefined, IsInt, Min } from 'class-validator';

export class GetColorNamesQueryDto {
  @ApiProperty({
    description: 'Id of the color group',
    example: 1,
  })
  @Transform(({ value }: { value: unknown }) => (value === undefined || value === '' ? undefined : Number(value)))
  @IsDefined({ message: 'groupId is required' })
  @Min(1)
  @IsInt()
  groupId!: number;
}
