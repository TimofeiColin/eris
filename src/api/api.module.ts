import { Module } from '@nestjs/common';

import { ColorModule } from './color/color.module';
import { ColorGroupsModule } from './color-groups/color-groups.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [DashboardModule, ColorGroupsModule, ColorModule],
})
export class ApiModule {}
