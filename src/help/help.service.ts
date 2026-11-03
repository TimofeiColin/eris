import { Injectable } from '@nestjs/common';
import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { DiscordCommand } from '../discord/discord-command';

const HELP_COLOR = 0x5865f2;

@Injectable()
export class HelpService {
  readonly commands: DiscordCommand[] = [
    {
      data: new SlashCommandBuilder().setName('help').setDescription('Show all available commands'),
      execute: (interaction, commands) => this.help(interaction, commands),
    },
  ];

  private async help(interaction: ChatInputCommandInteraction, commands: readonly DiscordCommand[]) {
    const embed = new EmbedBuilder()
      .setTitle('📖 Commands')
      .setDescription(commands.map(({ data }) => `**/${data.name}** — ${data.description}`).join('\n'))
      .setColor(HELP_COLOR);

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }
}
