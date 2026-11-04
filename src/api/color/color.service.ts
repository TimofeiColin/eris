import { Injectable, NotFoundException } from '@nestjs/common';

import { ColorGroupRepository, ColorRepository } from '../../database/repositories';

@Injectable()
export class ColorService {
  constructor(
    private readonly colorRepository: ColorRepository,
    private readonly colorGroupRepository: ColorGroupRepository,
  ) {}

  async getColorNamesByGroup(groupId: number) {
    const [groupExists, colors] = await Promise.all([
      this.colorGroupRepository.existsById(groupId),
      this.colorRepository.findNamesByGroup(groupId),
    ]);

    if (!groupExists) {
      throw new NotFoundException(`Color group ${groupId} does not exist`);
    }

    return colors;
  }
}
