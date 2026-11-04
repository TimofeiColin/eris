import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../database/database.module';
import { ColorService } from './color.service';
import { ColorCatalogService } from './color-catalog.service';
import { ColorRoleService } from './color-role.service';

@Module({
  imports: [DatabaseModule],
  providers: [ColorService, ColorRoleService, ColorCatalogService],
  exports: [ColorService],
})
export class ColorModule {}
