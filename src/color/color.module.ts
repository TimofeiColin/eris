import { Module } from '@nestjs/common';
import { ColorRoleService } from './color-role.service';
import { ColorService } from './color.service';

@Module({
  providers: [ColorService, ColorRoleService],
  exports: [ColorService],
})
export class ColorModule {}
