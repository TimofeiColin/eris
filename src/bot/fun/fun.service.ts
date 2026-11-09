import { Injectable } from '@nestjs/common';
import { ChatInputCommandInteraction, EmbedBuilder, Message, MessageFlags } from 'discord.js';

import { createSlashCommand, DiscordCommand } from '../discord/discord-command';
import { FunCommand } from './fun-command';
import { FunFactService } from './fun-fact.service';
import { JokeService } from './joke.service';
import { NekoService } from './neko.service';

@Injectable()
export class FunService {
  readonly commands: DiscordCommand[] = [
    {
      data: createSlashCommand().setName('fun').setDescription('Show the fun commands'),
      execute: (interaction) => this.listFunCommands(interaction),
    },
  ];

  private readonly color = 0x5865f2;

  private readonly funCommands: FunCommand[];

  constructor(nekoService: NekoService, jokeService: JokeService, funFactService: FunFactService) {
    this.funCommands = [nekoService, jokeService, funFactService];
  }

  async handleMessage(message: Message) {
    if (message.author.bot || !message.inGuild()) {
      return;
    }

    const content = message.content.trim().toLowerCase();
    const funCommand = this.funCommands.find(({ command }) => command === content);

    await funCommand?.reply(message);
  }

  private async listFunCommands(interaction: ChatInputCommandInteraction) {
    const embed = new EmbedBuilder()
      .setTitle('🎉 Fun commands')
      .setDescription(this.funCommands.map(({ command, description }) => `**${command}** — ${description}`).join('\n'))
      .setFooter({ text: 'Send one of these as its own message in any channel' })
      .setColor(this.color);

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }
}
