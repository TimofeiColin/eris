import { Module } from '@nestjs/common';
import { HelpService } from './help.service';

@Module({
  providers: [HelpService],
  exports: [HelpService],
})
export class HelpModule {}
