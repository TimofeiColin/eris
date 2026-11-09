import { Module } from '@nestjs/common';

import { JokeService } from './joke.service';

@Module({
  providers: [JokeService],
  exports: [JokeService],
})
export class JokeModule {}
