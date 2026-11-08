import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../database/database.module';
import { BotResponsesController } from './bot-responses.controller';
import { BotResponsesService } from './bot-responses.service';

@Module({
  imports: [DatabaseModule],
  controllers: [BotResponsesController],
  providers: [BotResponsesService],
})
export class BotResponsesModule {}
