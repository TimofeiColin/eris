import { Module } from '@nestjs/common';

import { ColorModule } from './color/color.module';
import { DiscordModule } from './discord/discord.module';
import { FunModule } from './fun/fun.module';
import { HelpModule } from './help/help.module';
import { PingModule } from './ping/ping.module';
import { ResponseModule } from './response/response.module';

@Module({
  imports: [ColorModule, DiscordModule, FunModule, HelpModule, PingModule, ResponseModule],
})
export class BotModule {}
