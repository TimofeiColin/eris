import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../database/database.module';
import { ColorController } from './color.controller';
import { ColorService } from './color.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ColorController],
  providers: [ColorService],
})
export class ColorModule {}
