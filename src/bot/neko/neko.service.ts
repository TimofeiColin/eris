import { Injectable, Logger } from '@nestjs/common';
import { EmbedBuilder, Message } from 'discord.js';

import { BatchQueue, downloadImage, fetchJson, isCommandMessage } from '../utils';

const NEKO_COMMAND = '!!!neko';

const NEKO_API_URL = 'https://nekos.best/api/v2/neko?amount=20';

const NEKO_COLOR = 0xf5a9b8;

interface Neko {
  url: string;
}

@Injectable()
export class NekoService {
  private readonly logger = new Logger(NekoService.name);

  private readonly nekos = new BatchQueue(() => this.fetchNekos());

  async handleMessage(message: Message) {
    if (!isCommandMessage(message, NEKO_COMMAND)) {
      return;
    }

    let neko: Neko;

    try {
      neko = await this.nekos.take();
    } catch (error) {
      this.logger.warn(`Could not get a neko: ${(error as Error).message}`);
      await message.reply({ content: 'No nekos right now, try again in a minute 🐾', allowedMentions: { parse: [] } });

      return;
    }

    const embed = new EmbedBuilder().setColor(NEKO_COLOR);

    try {
      const image = await downloadImage(neko.url);

      await message.reply({
        embeds: [embed.setImage(`attachment://${image.name}`)],
        files: [image],
        allowedMentions: { parse: [] },
      });
    } catch (error) {
      this.logger.warn(`Sending the neko link instead: ${(error as Error).message}`);
      await message.reply({ embeds: [embed.setImage(neko.url)], allowedMentions: { parse: [] } });
    }
  }

  private async fetchNekos() {
    const { results } = await fetchJson<{ results?: Neko[] }>(NEKO_API_URL);
    const nekos = (results ?? []).filter((neko) => typeof neko?.url === 'string');

    if (!nekos.length) {
      throw new Error('nekos.best returned no images');
    }

    return nekos;
  }
}
