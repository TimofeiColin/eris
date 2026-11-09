import { IncomingMessage, ServerResponse } from 'node:http';

import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { Controller, Delete, Get, HttpException, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { ApiKeyGuard } from '../api/guards';
import { McpService } from './mcp.service';

const methodNotAllowed = () =>
  new HttpException(
    { jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed' }, id: null },
    HttpStatus.METHOD_NOT_ALLOWED,
  );

@ApiExcludeController()
@Controller('mcp')
@UseGuards(ApiKeyGuard)
export class McpController {
  constructor(private readonly mcpService: McpService) {}

  @Post()
  async handle(@Req() request: IncomingMessage & { body?: unknown }, @Res() response: ServerResponse) {
    const server = this.mcpService.createServer();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

    response.on('close', () => {
      void transport.close();
      void server.close();
    });

    await server.connect(transport);
    await transport.handleRequest(request, response, request.body);
  }

  @Get()
  get() {
    throw methodNotAllowed();
  }

  @Delete()
  delete() {
    throw methodNotAllowed();
  }
}
