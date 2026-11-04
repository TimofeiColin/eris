import { Module } from '@nestjs/common';

import { ColorModule } from '../color/color.module';
import { HelpModule } from '../help/help.module';
import { PingModule } from '../ping/ping.module';
import { DiscordService } from './discord.service';

@Module({
  imports: [ColorModule, HelpModule, PingModule],
  providers: [DiscordService],
  exports: [DiscordService],
})
export class DiscordModule {}
