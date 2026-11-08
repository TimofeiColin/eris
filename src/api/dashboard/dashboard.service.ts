import { Injectable } from '@nestjs/common';

import { BotResponseRepository, ColorGroupRepository, ColorRepository } from '../../database/repositories';

@Injectable()
export class DashboardService {
  constructor(
    private readonly colorGroupRepository: ColorGroupRepository,
    private readonly colorRepository: ColorRepository,
    private readonly botResponseRepository: BotResponseRepository,
  ) {}

  async getStats() {
    const [colorGroups, colors, responses] = await Promise.all([
      this.colorGroupRepository.countGroups(),
      this.colorRepository.countColors(),
      this.botResponseRepository.countBotResponses(),
    ]);

    return { colorGroups, colors, responses };
  }
}
