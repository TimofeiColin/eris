import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export interface DiscordCommand {
  data: SlashCommandBuilder;
  execute(interaction: ChatInputCommandInteraction, commands: readonly DiscordCommand[]): Promise<void>;
}
