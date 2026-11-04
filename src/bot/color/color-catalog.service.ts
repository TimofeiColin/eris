import { Injectable } from '@nestjs/common';

import { ColorGroupRepository, ColorRepository } from '../../database/repositories';
import { Color } from '../../database/schemas/color.schema';
import { ColorGroupView, ColorOption } from './types';

const toColorOption = ({ name, hex }: Color): ColorOption => ({ name, hex, value: parseInt(hex.slice(1), 16) });

@Injectable()
export class ColorCatalogService {
  constructor(
    private readonly colorRepository: ColorRepository,
    private readonly colorGroupRepository: ColorGroupRepository,
  ) {}

  async getGroupsWithColors(): Promise<ColorGroupView[]> {
    const groups = await this.colorGroupRepository.findGroupsWithColors();

    return groups.map(({ name, colors }) => ({ name, colors: colors.map(toColorOption) }));
  }

  async findColorByNames(names: string[]): Promise<ColorOption | undefined> {
    if (!names.length) {
      return undefined;
    }

    const color = await this.colorRepository.findFirstColorByNames(names);

    return color ? toColorOption(color) : undefined;
  }
}
