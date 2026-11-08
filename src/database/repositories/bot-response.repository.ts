import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BotResponse } from '../schemas/bot-response.schema';
import { escapeRegex } from '../utils';

const botResponsesFilter = (command?: string, response?: string) => ({
  ...(command ? { command: { $regex: escapeRegex(command), $options: 'i' } } : {}),
  ...(response ? { responses: { $regex: escapeRegex(response), $options: 'i' } } : {}),
});

@Injectable()
export class BotResponseRepository {
  private readonly changeListeners = new Set<() => void>();

  constructor(@InjectModel(BotResponse.name) private readonly botResponseModel: Model<BotResponse>) {}

  onChange(listener: () => void) {
    this.changeListeners.add(listener);
  }

  findBotResponseById(id: number) {
    return this.botResponseModel.findOne({ _id: id }).lean();
  }

  findBotResponseByCommand(command: string) {
    return this.botResponseModel.findOne({ command }).collation({ locale: 'en', strength: 2 }).lean();
  }

  findAllBotResponses() {
    return this.botResponseModel.find().sort({ _id: 1 }).lean();
  }

  findBotResponsesPaginated(command: string | undefined, response: string | undefined, skip: number, limit: number) {
    return this.botResponseModel
      .find(botResponsesFilter(command, response))
      .sort({ _id: 1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  countBotResponses(command?: string, response?: string) {
    return this.botResponseModel.countDocuments(botResponsesFilter(command, response));
  }

  async createBotResponse(botResponse: Omit<BotResponse, '_id'>) {
    const lastBotResponse = await this.botResponseModel.findOne({}, { _id: 1 }).sort({ _id: -1 }).lean();

    const created = await this.botResponseModel.create({ _id: (lastBotResponse?._id ?? 0) + 1, ...botResponse });

    this.notifyChange();

    return created.toObject();
  }

  async updateBotResponse(id: number, botResponse: Omit<BotResponse, '_id'>) {
    const updated = await this.botResponseModel
      .findOneAndUpdate({ _id: id }, botResponse, { returnDocument: 'after', runValidators: true })
      .lean();

    if (updated) {
      this.notifyChange();
    }

    return updated;
  }

  async deleteBotResponse(id: number) {
    const { deletedCount } = await this.botResponseModel.deleteOne({ _id: id });

    if (deletedCount > 0) {
      this.notifyChange();
    }

    return deletedCount > 0;
  }

  private notifyChange() {
    this.changeListeners.forEach((listener) => listener());
  }
}
