import { Module } from '@nestjs/common';

import { BotResponsesModule } from '../../api/bot-responses/bot-responses.module';
import { BotResponsesTools } from './bot-responses.tools';

@Module({
  imports: [BotResponsesModule],
  providers: [BotResponsesTools],
  exports: [BotResponsesTools],
})
export class BotResponsesMcpModule {}
