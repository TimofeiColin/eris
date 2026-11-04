import { Injectable } from '@nestjs/common';
import { ChatInputCommandInteraction } from 'discord.js';

import { createSlashCommand, DiscordCommand } from '../discord/discord-command';

@Injectable()
export class PingService {
  readonly commands: DiscordCommand[] = [
    {
      data: createSlashCommand().setName('ping').setDescription('Check that the bot is responding'),
      execute: (interaction) => this.ping(interaction),
    },
  ];

  private async ping(interaction: ChatInputCommandInteraction) {
    await interaction.reply('Pong!');
  }
}
