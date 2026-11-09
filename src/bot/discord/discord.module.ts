import { Module } from '@nestjs/common';

import { ColorModule } from '../color/color.module';
import { HelpModule } from '../help/help.module';
import { NekoModule } from '../neko/neko.module';
import { PingModule } from '../ping/ping.module';
import { ResponseModule } from '../response/response.module';
import { DiscordService } from './discord.service';

@Module({
  imports: [ColorModule, HelpModule, NekoModule, PingModule, ResponseModule],
  providers: [DiscordService],
  exports: [DiscordService],
})
export class DiscordModule {}
