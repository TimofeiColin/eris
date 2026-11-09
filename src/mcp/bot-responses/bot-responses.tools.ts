import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { HttpException, Injectable } from '@nestjs/common';
import { z } from 'zod';

import { BotResponsesService } from '../../api/bot-responses/bot-responses.service';
import { CacheService } from '../../cache/cache.service';

const botResponseSchema = z.object({
  id: z.number(),
  command: z.string(),
  replies: z.array(z.string()),
});

const newBotResponseSchema = z.object({
  command: z.string().trim().min(1).max(200).describe('Message the bot replies to, matched in any case'),
  replies: z.array(z.string().trim().min(1).max(2000)).min(1).max(50).describe('Replies the bot picks from at random'),
});

@Injectable()
export class BotResponsesTools {
  constructor(
    private readonly cacheService: CacheService,
    private readonly botResponsesService: BotResponsesService,
  ) {}

  register(server: McpServer) {
    server.registerTool(
      'get_bot_responses',
      {
        title: 'Get bot responses',
        description:
          'Lists every message the Discord bot replies to: the id, the command a message has to end with, and the replies the bot picks from at random.',
        outputSchema: { botResponses: z.array(botResponseSchema) },
        annotations: { readOnlyHint: true },
      },
      async () => {
        const botResponses = (await this.cacheService.getBotResponses()).map(({ _id, command, responses }) => ({
          id: _id,
          command,
          replies: responses,
        }));

        return {
          content: [{ type: 'text', text: JSON.stringify(botResponses) }],
          structuredContent: { botResponses },
        };
      },
    );

    server.registerTool(
      'create_bot_responses',
      {
        title: 'Create bot responses',
        description:
          'Adds new messages for the Discord bot to reply to. Each command must be unique in any case. Entries whose command already exists are skipped and listed with the reason; the others are still created.',
        inputSchema: { botResponses: z.array(newBotResponseSchema).min(1).max(50) },
        outputSchema: {
          created: z.array(botResponseSchema),
          skipped: z.array(z.object({ command: z.string(), reason: z.string() })),
        },
        annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
      },
      async ({ botResponses }) => {
        const created: z.infer<typeof botResponseSchema>[] = [];
        const skipped: { command: string; reason: string }[] = [];

        for (const { command, replies } of botResponses) {
          try {
            const botResponse = await this.botResponsesService.createBotResponse({ command, responses: replies });

            created.push({ id: botResponse._id, command: botResponse.command, replies: botResponse.responses });
          } catch (error) {
            if (!(error instanceof HttpException)) {
              throw error;
            }

            skipped.push({ command, reason: error.message });
          }
        }

        const result = { created, skipped };

        return {
          content: [{ type: 'text', text: JSON.stringify(result) }],
          structuredContent: result,
        };
      },
    );
  }
}
