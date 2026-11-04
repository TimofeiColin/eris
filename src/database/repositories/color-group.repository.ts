import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CASE_INSENSITIVE } from '../case-insensitive';
import { Color } from '../schemas/color.schema';
import { ColorGroup } from '../schemas/color-group.schema';
import { getLimit, getSkip } from '../utils';

export const COLOR_GROUPS_PER_PAGE = 6;

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const nameFilter = (name: string | undefined) => (name ? { name: { $regex: escapeRegex(name), $options: 'i' } } : {});

export type ColorGroupWithColors = ColorGroup & { colors: Color[] };
export type ColorGroupSummary = ColorGroup & { colorsCount: number };

@Injectable()
export class ColorGroupRepository {
  constructor(
    @InjectModel(ColorGroup.name) private readonly colorGroupModel: Model<ColorGroup>,
    @InjectModel(Color.name) private readonly colorModel: Model<Color>,
  ) {}

  countGroups() {
    return this.colorGroupModel.countDocuments();
  }

  async existsById(id: number) {
    return (await this.colorGroupModel.exists({ _id: id })) !== null;
  }

  async existsByName(name: string, excludeId?: number) {
    const filter = excludeId === undefined ? { name } : { name, _id: { $ne: excludeId } };

    return (await this.colorGroupModel.exists(filter).collation(CASE_INSENSITIVE)) !== null;
  }

  countColorsInGroup(id: number) {
    return this.colorModel.countDocuments({ group: id });
  }

  async updateGroupName(id: number, name: string) {
    const { matchedCount } = await this.colorGroupModel.updateOne({ _id: id }, { name });

    return matchedCount > 0;
  }

  async deleteGroup(id: number) {
    const { deletedCount } = await this.colorGroupModel.deleteOne({ _id: id });

    return deletedCount > 0;
  }

  async createGroup(name: string) {
    const lastGroup = await this.colorGroupModel.findOne({}, { _id: 1 }).sort({ _id: -1 }).lean();
    const group = await this.colorGroupModel.create({ _id: (lastGroup?._id ?? 0) + 1, name });

    return group.toObject();
  }

  countGroupNames(name: string | undefined) {
    return this.colorGroupModel.countDocuments(nameFilter(name));
  }

  findGroupNames(name: string | undefined, page: number) {
    return this.colorGroupModel.aggregate<ColorGroupSummary>([
      { $match: nameFilter(name) },
      { $sort: { _id: 1 } },
      { $skip: getSkip(page, COLOR_GROUPS_PER_PAGE) },
      { $limit: getLimit(COLOR_GROUPS_PER_PAGE) },
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
}
