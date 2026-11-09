import { Injectable, Logger } from '@nestjs/common';
import { Message } from 'discord.js';

import { fetchJson } from '../utils';
import { FunCommand } from './fun-command';

@Injectable()
export class FunFactService implements FunCommand {
  readonly command = '!!!funfact';

  readonly description = 'A random fun fact';

  private readonly apiUrl = 'https://uselessfacts.jsph.pl/api/v2/facts/random?language=en';

  private readonly messageLimit = 2000;

  private readonly logger = new Logger(FunFactService.name);

  async reply(message: Message) {
    let funFact: string;

    try {
      funFact = await this.fetchFunFact();
    } catch (error) {
      this.logger.warn(`Could not get a fun fact: ${(error as Error).message}`);
      funFact = 'No fun facts right now, try again in a minute 🤓';
    }

    await message.reply({ content: funFact, allowedMentions: { parse: [] } });
  }

  private async fetchFunFact() {
    const { text } = await fetchJson<{ text?: string }>(this.apiUrl);
    const funFact = typeof text === 'string' ? text.trim() : '';

    if (!funFact || funFact.length > this.messageLimit) {
      throw new Error('uselessfacts returned no fact');
    }

    return funFact;
  }
}
