import { Injectable } from '@nestjs/common';

import { BotResponseRepository } from '../database/repositories';
import { BotResponse } from '../database/schemas/bot-response.schema';

@Injectable()
export class CacheService {
  private botResponses: BotResponse[] | null = null;

  private botResponsesLoading: Promise<BotResponse[]> | null = null;

  constructor(private readonly botResponseRepository: BotResponseRepository) {
    botResponseRepository.onChange(() => this.resetBotResponses());
  }

  async getBotResponses(): Promise<BotResponse[]> {
    const botResponses = this.botResponses ?? (await this.loadBotResponses());

    return botResponses.map((botResponse) => ({ ...botResponse, responses: [...botResponse.responses] }));
  }

  resetBotResponses() {
    this.botResponses = null;
    this.botResponsesLoading = null;
  }

  private async loadBotResponses() {
    const loading = (this.botResponsesLoading ??= this.botResponseRepository.findAllBotResponses().exec());
    const botResponses = await loading;

    if (this.botResponsesLoading === loading) {
      this.botResponses = botResponses;
      this.botResponsesLoading = null;
    }

    return botResponses;
  }
}
