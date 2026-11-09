import { Message } from 'discord.js';

export interface FunCommand {
  readonly command: string;
  readonly description: string;
  reply(message: Message): Promise<void>;
}
