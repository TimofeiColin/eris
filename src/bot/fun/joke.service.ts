import { Injectable, Logger } from '@nestjs/common';
import { Message } from 'discord.js';

import { BatchQueue, fetchJson } from '../utils';
import { FunCommand } from './fun-command';

interface Joke {
  joke: string;
  safe: boolean;
}

@Injectable()
export class JokeService implements FunCommand {
  readonly command = '!!!joke';

  readonly description = 'A random one-line joke';

  private readonly apiUrl = 'https://v2.jokeapi.dev/joke/Any?type=single&safe-mode&amount=10';

  private readonly messageLimit = 2000;

  private readonly logger = new Logger(JokeService.name);

  private readonly jokes = new BatchQueue(() => this.fetchJokes());

  async reply(message: Message) {
    let joke: string;

    try {
      joke = await this.jokes.take();
    } catch (error) {
      this.logger.warn(`Could not get a joke: ${(error as Error).message}`);
      joke = 'No jokes right now, try again in a minute 🙃';
    }

    await message.reply({ content: joke, allowedMentions: { parse: [] } });
  }

  private async fetchJokes() {
    const { jokes } = await fetchJson<{ jokes?: Joke[] }>(this.apiUrl);
    const texts = (jokes ?? [])
      .filter((joke) => joke?.safe && typeof joke.joke === 'string')
      .map((joke) => joke.joke.trim())
      .filter((joke) => joke && joke.length <= this.messageLimit);

    if (!texts.length) {
      throw new Error('JokeAPI returned no jokes');
    }

    return texts;
  }
}
