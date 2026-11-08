import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiConflictResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { ApiKeyAuth } from '../guards';
import { okResponse } from '../swagger';
import {
  botResponseCommandConflictResponse,
  botResponseNotFoundResponse,
  botResponseOkResponse,
  getBotResponsesPaginatedOkResponse,
} from './api-responses';
import { BotResponsesService } from './bot-responses.service';
import { CreateBotResponseDto, GetBotResponsesQueryDto, UpdateBotResponseDto } from './dto';

@ApiTags('Bot Responses')
@Controller()
@ApiKeyAuth()
export class BotResponsesController {
  constructor(private readonly botResponsesService: BotResponsesService) {}

  @Get('bot-responses')
  @ApiOkResponse(getBotResponsesPaginatedOkResponse)
  getBotResponsesPaginated(@Query() query: GetBotResponsesQueryDto) {
    return this.botResponsesService.getBotResponsesPaginated(query.page, query.command, query.response);
  }

  @Post('bot-responses')
  @ApiCreatedResponse(botResponseOkResponse)
  @ApiConflictResponse(botResponseCommandConflictResponse)
  createBotResponse(@Body() body: CreateBotResponseDto) {
    return this.botResponsesService.createBotResponse(body);
  }

  @Patch('bot-responses/:id')
  @ApiOkResponse(botResponseOkResponse)
  @ApiNotFoundResponse(botResponseNotFoundResponse)
  @ApiConflictResponse(botResponseCommandConflictResponse)
  updateBotResponse(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateBotResponseDto) {
    return this.botResponsesService.updateBotResponse(id, body);
  }

  @Delete('bot-responses/:id')
  @ApiOkResponse(okResponse)
  @ApiNotFoundResponse(botResponseNotFoundResponse)
  deleteBotResponse(@Param('id', ParseIntPipe) id: number) {
    return this.botResponsesService.deleteBotResponse(id);
  }
}
