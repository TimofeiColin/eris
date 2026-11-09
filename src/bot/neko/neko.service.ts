import { Injectable, Logger } from '@nestjs/common';
import { EmbedBuilder, Message } from 'discord.js';

import { downloadImage } from '../utils';

const NEKO_COMMAND = '!!!neko';

const NEKO_API_URL = 'https://nekos.best/api/v2/neko?amount=20';

const NEKO_COLOR = 0xf5a9b8;

const REQUEST_TIMEOUT = 10_000;

interface Neko {
  url: string;
}

@Injectable()
export class NekoService {
  private readonly logger = new Logger(NekoService.name);

  private nekos: Neko[] = [];

  private nekosLoading: Promise<Neko[]> | null = null;

  async handleMessage(message: Message) {
    if (message.author.bot || !message.inGuild() || message.content.trim().toLowerCase() !== NEKO_COMMAND) {
      return;
    }

    let neko: Neko;

    try {
      neko = await this.takeNeko();
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

  private async takeNeko() {
    while (!this.nekos.length) {
      this.nekos = await (this.nekosLoading ??= this.fetchNekos().finally(() => (this.nekosLoading = null)));
    }

    return this.nekos.shift()!;
  }

  private async fetchNekos() {
    const response = await fetch(NEKO_API_URL, {
      headers: { 'User-Agent': 'Eris Discord bot' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    });

    if (!response.ok) {
      throw new Error(`nekos.best answered with status ${response.status}`);
    }

    const { results } = (await response.json()) as { results?: Neko[] };
    const nekos = (results ?? []).filter((neko) => typeof neko?.url === 'string');

    if (!nekos.length) {
      throw new Error('nekos.best returned no images');
    }

    return nekos;
  }
}
