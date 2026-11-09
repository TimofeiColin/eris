import { Module } from '@nestjs/common';

import { NekoService } from './neko.service';

@Module({
  providers: [NekoService],
  exports: [NekoService],
})
export class NekoModule {}
