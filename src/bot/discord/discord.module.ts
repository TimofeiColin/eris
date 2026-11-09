import { Module } from '@nestjs/common';

import { ColorModule } from '../color/color.module';
import { FunModule } from '../fun/fun.module';
import { HelpModule } from '../help/help.module';
import { PingModule } from '../ping/ping.module';
import { ResponseModule } from '../response/response.module';
import { DiscordService } from './discord.service';

@Module({
  imports: [ColorModule, FunModule, HelpModule, PingModule, ResponseModule],
  providers: [DiscordService],
  exports: [DiscordService],
})
export class DiscordModule {}
