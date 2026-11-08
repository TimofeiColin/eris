import { Injectable } from '@nestjs/common';
import { Message } from 'discord.js';

import { CacheService } from '../../cache/cache.service';
import { BotResponse } from '../../database/schemas/bot-response.schema';

const WORD_CHARACTER = /[\p{L}\p{N}]/u;

@Injectable()
export class ResponseService {
  constructor(private readonly cacheService: CacheService) {}

  async handleMessage(message: Message) {
    if (message.author.bot || !message.inGuild() || !message.content) {
      return;
    }

    const botResponse = this.findBotResponse(message.content, await this.cacheService.getBotResponses());

    if (!botResponse?.responses.length) {
      return;
    }

    const reply = botResponse.responses[Math.floor(Math.random() * botResponse.responses.length)];

    await message.reply({ content: reply, allowedMentions: { parse: [] } });
  }

  private findBotResponse(content: string, botResponses: BotResponse[]) {
    const text = this.normalize(content);
    let match: BotResponse | undefined;
    let matchLength = 0;

    for (const botResponse of botResponses) {
      const command = this.normalize(botResponse.command);

      if (
        command.length > matchLength &&
        text.endsWith(command) &&
        this.startsAtWordBoundary(text, text.length - command.length)
      ) {
        match = botResponse;
        matchLength = command.length;
      }
    }

    return match;
  }

  private normalize(text: string) {
    return text.trim().toLowerCase();
  }

  private startsAtWordBoundary(text: string, index: number) {
    return index === 0 || !WORD_CHARACTER.test(text[index - 1]);
  }
}
