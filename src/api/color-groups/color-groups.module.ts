import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../database/database.module';
import { ColorGroupsController } from './color-groups.controller';
import { ColorGroupsService } from './color-groups.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ColorGroupsController],
  providers: [ColorGroupsService],
})
export class ColorGroupsModule {}
