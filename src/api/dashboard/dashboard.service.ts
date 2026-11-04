import { Injectable } from '@nestjs/common';

import { ColorGroupRepository, ColorRepository } from '../../database/repositories';

@Injectable()
export class DashboardService {
  constructor(
    private readonly colorGroupRepository: ColorGroupRepository,
    private readonly colorRepository: ColorRepository,
  ) {}

  async getStats() {
    const [colorGroups, colors] = await Promise.all([
      this.colorGroupRepository.countGroups(),
      this.colorRepository.countColors(),
    ]);

    return { colorGroups, colors, sayings: 0 };
  }
}
