import { Module } from '@nestjs/common';

import { BotResponsesModule } from './bot-responses/bot-responses.module';
import { ColorModule } from './color/color.module';
import { ColorGroupsModule } from './color-groups/color-groups.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [DashboardModule, ColorGroupsModule, ColorModule, BotResponsesModule],
})
export class ApiModule {}
