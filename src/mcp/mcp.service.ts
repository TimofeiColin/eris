import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Injectable } from '@nestjs/common';

import { BotResponsesTools } from './bot-responses/bot-responses.tools';

@Injectable()
export class McpService {
  constructor(private readonly botResponsesTools: BotResponsesTools) {}

  createServer() {
    const server = new McpServer({ name: 'eris', version: '1.0.0' });

    this.botResponsesTools.register(server);

    return server;
  }
}
