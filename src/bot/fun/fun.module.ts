import { Module } from '@nestjs/common';

import { FunService } from './fun.service';
import { FunFactService } from './fun-fact.service';
import { JokeService } from './joke.service';
import { NekoService } from './neko.service';

@Module({
  providers: [FunService, FunFactService, JokeService, NekoService],
  exports: [FunService],
})
export class FunModule {}
