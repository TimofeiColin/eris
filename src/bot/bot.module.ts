import { Module } from '@nestjs/common';

import { ColorModule } from './color/color.module';
import { DiscordModule } from './discord/discord.module';
import { HelpModule } from './help/help.module';
import { PingModule } from './ping/ping.module';

@Module({
  imports: [ColorModule, DiscordModule, HelpModule, PingModule],
})
export class BotModule {}
