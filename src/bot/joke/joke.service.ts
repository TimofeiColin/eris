import { Injectable, Logger } from '@nestjs/common';
import { Message } from 'discord.js';

import { BatchQueue, fetchJson, isCommandMessage } from '../utils';

const JOKE_COMMAND = '!!!joke';

const JOKE_API_URL = 'https://v2.jokeapi.dev/joke/Any?type=single&safe-mode&amount=10';

const MESSAGE_LIMIT = 2000;

interface Joke {
  joke: string;
  safe: boolean;
}

@Injectable()
export class JokeService {
  private readonly logger = new Logger(JokeService.name);

  private readonly jokes = new BatchQueue(() => this.fetchJokes());

  async handleMessage(message: Message) {
    if (!isCommandMessage(message, JOKE_COMMAND)) {
      return;
    }

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
    const { jokes } = await fetchJson<{ jokes?: Joke[] }>(JOKE_API_URL);
    const texts = (jokes ?? [])
      .filter((joke) => joke?.safe && typeof joke.joke === 'string')
      .map((joke) => joke.joke.trim())
      .filter((joke) => joke && joke.length <= MESSAGE_LIMIT);

    if (!texts.length) {
      throw new Error('JokeAPI returned no jokes');
    }

    return texts;
  }
}
