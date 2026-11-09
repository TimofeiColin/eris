import { Injectable } from '@nestjs/common';
import { ChatInputCommandInteraction, EmbedBuilder, Message, MessageFlags } from 'discord.js';

import { CacheService } from '../../cache/cache.service';
import { BotResponse } from '../../database/schemas/bot-response.schema';
import { createSlashCommand, DiscordCommand } from '../discord/discord-command';

const RESPONSE_PREFIX = '!!';

const RESPONSES_COLOR = 0x5865f2;

const EMBED_DESCRIPTION_LIMIT = 4096;

@Injectable()
export class ResponseService {
  readonly commands: DiscordCommand[] = [
    {
      data: createSlashCommand().setName('responses').setDescription('Show the messages the bot replies to'),
      execute: (interaction) => this.listResponses(interaction),
    },
  ];

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

  private async listResponses(interaction: ChatInputCommandInteraction) {
    const botResponses = (await this.cacheService.getBotResponses()).sort((a, b) => a.command.localeCompare(b.command));
    const lines = botResponses.map(
      ({ command, responses }) =>
        `**${RESPONSE_PREFIX}${command}** — ${responses.length} ${responses.length === 1 ? 'reply' : 'replies'}`,
    );

    const embed = new EmbedBuilder()
      .setTitle('💬 Responses')
      .setDescription(lines.length ? this.fitLines(lines) : 'No responses yet.')
      .setFooter({ text: 'Send one of these as its own message and I will reply' })
      .setColor(RESPONSES_COLOR);

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }

  private fitLines(lines: string[]) {
    let text = '';

    for (const [index, line] of lines.entries()) {
      const more = `\n…and ${lines.length - index} more`;
      const next = text ? `${text}\n${line}` : line;

      if (next.length + more.length > EMBED_DESCRIPTION_LIMIT && index < lines.length - 1) {
        return text + more;
      }

      text = next;
    }

    return text;
  }

  private findBotResponse(content: string, botResponses: BotResponse[]) {
    const text = this.normalize(content);

    if (!text.startsWith(RESPONSE_PREFIX)) {
      return;
    }

    const command = this.normalize(text.slice(RESPONSE_PREFIX.length));

    return botResponses.find((botResponse) => this.normalize(botResponse.command) === command);
  }

  private normalize(text: string) {
    return text.trim().toLowerCase();
  }
}
