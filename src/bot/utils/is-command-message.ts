import { Message } from 'discord.js';

export const isCommandMessage = (message: Message, command: string) =>
  !message.author.bot && message.inGuild() && message.content.trim().toLowerCase() === command;
