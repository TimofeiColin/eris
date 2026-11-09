import { Module } from '@nestjs/common';

import { ColorModule } from './color/color.module';
import { DiscordModule } from './discord/discord.module';
import { HelpModule } from './help/help.module';
import { JokeModule } from './joke/joke.module';
import { NekoModule } from './neko/neko.module';
import { PingModule } from './ping/ping.module';
import { ResponseModule } from './response/response.module';

@Module({
  imports: [ColorModule, DiscordModule, HelpModule, JokeModule, NekoModule, PingModule, ResponseModule],
})
export class BotModule {}
