import { Injectable } from '@nestjs/common';

import { BotResponseRepository } from '../../database/repositories';
import {
  alreadyExists,
  BOT_RESPONSES_PER_PAGE,
  getItems,
  getLimit,
  getPageInfo,
  getSkip,
  notFound,
  rethrowDuplicate,
} from '../utils';
import { CreateBotResponseDto, UpdateBotResponseDto } from './dto';

const commandTaken = (command: string) => alreadyExists(`Bot response for "${command}"`);

const botResponseNotFound = (id: number) => notFound(`Bot response ${id}`);

@Injectable()
export class BotResponsesService {
  constructor(private readonly botResponseRepository: BotResponseRepository) {}

  async getBotResponsesPaginated(page: number, command?: string, response?: string) {
    const [botResponses, totalBotResponses] = await Promise.all([
      this.botResponseRepository.findBotResponsesPaginated(
        command,
        response,
        getSkip(page, BOT_RESPONSES_PER_PAGE),
        getLimit(BOT_RESPONSES_PER_PAGE),
      ),
      this.botResponseRepository.countBotResponses(command, response),
    ]);

    return {
      page,
      ...getPageInfo(page, BOT_RESPONSES_PER_PAGE, botResponses, totalBotResponses),
      items: getItems(botResponses, BOT_RESPONSES_PER_PAGE),
    };
  }

  async createBotResponse({ command, responses }: CreateBotResponseDto) {
    if (await this.botResponseRepository.findBotResponseByCommand(command)) {
      throw commandTaken(command);
    }

    return rethrowDuplicate(this.botResponseRepository.createBotResponse({ command, responses }), () =>
      commandTaken(command),
    );
  }

  async updateBotResponse(id: number, { command, responses }: UpdateBotResponseDto) {
    const [botResponse, botResponseWithCommand] = await Promise.all([
      this.botResponseRepository.findBotResponseById(id),
      this.botResponseRepository.findBotResponseByCommand(command),
    ]);

    if (!botResponse) {
      throw botResponseNotFound(id);
    }

    if (botResponseWithCommand && botResponseWithCommand._id !== id) {
      throw commandTaken(command);
    }

    const updated = await rethrowDuplicate(
      this.botResponseRepository.updateBotResponse(id, { command, responses }),
      () => commandTaken(command),
    );

    if (!updated) {
      throw botResponseNotFound(id);
    }

    return updated;
  }

  async deleteBotResponse(id: number) {
    if (!(await this.botResponseRepository.findBotResponseById(id))) {
      throw botResponseNotFound(id);
    }

    if (!(await this.botResponseRepository.deleteBotResponse(id))) {
      throw botResponseNotFound(id);
    }

    return { message: 'ok' };
  }
}
