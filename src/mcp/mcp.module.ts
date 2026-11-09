import { Module } from '@nestjs/common';

import { BotResponsesMcpModule } from './bot-responses/bot-responses-mcp.module';
import { McpController } from './mcp.controller';
import { McpService } from './mcp.service';

@Module({
  imports: [BotResponsesMcpModule],
  controllers: [McpController],
  providers: [McpService],
})
export class McpModule {}
