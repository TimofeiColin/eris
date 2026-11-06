import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { escapeRegex } from '../../common/escape-regex';
import { Color } from '../schemas/color.schema';
import { ColorGroup } from '../schemas/color-group.schema';

const nameFilter = (name: string | undefined) => (name ? { name: { $regex: escapeRegex(name), $options: 'i' } } : {});

export type ColorGroupWithColors = ColorGroup & { colors: Color[] };
export type ColorGroupSummary = ColorGroup & { colorsCount: number };

@Injectable()
export class ColorGroupRepository {
  constructor(
    @InjectModel(ColorGroup.name) private readonly colorGroupModel: Model<ColorGroup>,
    @InjectModel(Color.name) private readonly colorModel: Model<Color>,
  ) {}

  findGroupById(id: number) {
    return this.colorGroupModel.findOne({ _id: id }, { _id: 1, name: 1 }).lean();
  }

  findGroupByName(name: string) {
    return this.colorGroupModel.findOne({ name }, { _id: 1, name: 1 }).collation({ locale: 'en', strength: 2 }).lean();
  }

  findGroupsNames() {
    return this.colorGroupModel.find({}, { _id: 1, name: 1 }).sort({ _id: 1 }).lean();
  }

  findGroupsWithColors() {
    return this.colorGroupModel.aggregate<ColorGroupWithColors>([
      { $sort: { _id: 1 } },
      {
        $lookup: {
          from: this.colorModel.collection.name,
          localField: '_id',
          foreignField: 'group',
          pipeline: [{ $sort: { _id: 1 } }],
          as: 'colors',
        },
      },
      { $match: { 'colors.0': { $exists: true } } },
    ]);
  }

  findGroupsPaginated(name: string | undefined, skip: number, limit: number) {
    return this.colorGroupModel.aggregate<ColorGroupSummary>([
      { $match: nameFilter(name) },
      { $sort: { _id: 1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: this.colorModel.collection.name,
          localField: '_id',
          foreignField: 'group',
          pipeline: [{ $project: { _id: 1 } }],
          as: 'colors',
        },
      },
      { $project: { _id: 1, name: 1, colorsCount: { $size: '$colors' } } },
    ]);
  }

  countGroups(name?: string) {
    return this.colorGroupModel.countDocuments(nameFilter(name));
  }

  async createGroup(name: string) {
    const lastGroup = await this.colorGroupModel.findOne({}, { _id: 1 }).sort({ _id: -1 }).lean();
    const group = await this.colorGroupModel.create({ _id: (lastGroup?._id ?? 0) + 1, name });

    return group.toObject();
  }

  async updateGroupName(id: number, name: string) {
    const { matchedCount } = await this.colorGroupModel.updateOne({ _id: id }, { name });

    return matchedCount > 0;
  }

  async deleteGroup(id: number) {
    const { deletedCount } = await this.colorGroupModel.deleteOne({ _id: id });

    return deletedCount > 0;
  }
}
