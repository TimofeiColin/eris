import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { escapeRegex } from '../../common/escape-regex';
import { Color } from '../schemas/color.schema';
import { ColorGroup } from '../schemas/color-group.schema';

const colorsFilter = (name?: string, groupId?: number) => ({
  ...(name ? { name: { $regex: escapeRegex(name), $options: 'i' } } : {}),
  ...(groupId === undefined ? {} : { group: groupId }),
});

export type ColorWithGroupName = Color & { groupName: string | null };

@Injectable()
export class ColorRepository {
  constructor(
    @InjectModel(Color.name) private readonly colorModel: Model<Color>,
    @InjectModel(ColorGroup.name) private readonly colorGroupModel: Model<ColorGroup>,
  ) {}

  findColorById(id: number) {
    return this.colorModel.findOne({ _id: id }, { _id: 1, name: 1, hex: 1, group: 1 }).lean();
  }

  findColorByName(name: string) {
    return this.colorModel
      .findOne({ name }, { _id: 1, name: 1, hex: 1, group: 1 })
      .collation({ locale: 'en', strength: 2 })
      .lean();
  }

  findNamesByGroup(groupId: number) {
    return this.colorModel.find({ group: groupId }, { _id: 1, name: 1 }).sort({ _id: 1 }).lean();
  }

  findFirstColorByNames(names: string[]) {
    return this.colorModel
      .findOne({ name: { $in: names } })
      .sort({ _id: 1 })
      .lean();
  }

  findColorsPaginated(name: string | undefined, groupId: number | undefined, skip: number, limit: number) {
    return this.colorModel.aggregate<ColorWithGroupName>([
      { $match: colorsFilter(name, groupId) },
      { $sort: { _id: 1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: this.colorGroupModel.collection.name,
          localField: 'group',
          foreignField: '_id',
          pipeline: [{ $project: { _id: 0, name: 1 } }],
          as: 'colorGroup',
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          hex: 1,
          group: 1,
          groupName: { $ifNull: [{ $arrayElemAt: ['$colorGroup.name', 0] }, null] },
        },
      },
    ]);
  }

  countColors(name?: string, groupId?: number) {
    return this.colorModel.countDocuments(colorsFilter(name, groupId));
  }

  countColorsInGroup(groupId: number) {
    return this.colorModel.countDocuments({ group: groupId });
  }

  async createColor(color: Omit<Color, '_id'>) {
    const lastColor = await this.colorModel.findOne({}, { _id: 1 }).sort({ _id: -1 }).lean();

    await this.colorModel.create({ _id: (lastColor?._id ?? 0) + 1, ...color });
  }

  async updateColor(id: number, color: Omit<Color, '_id'>) {
    const { matchedCount } = await this.colorModel.updateOne({ _id: id }, color, { runValidators: true });

    return matchedCount > 0;
  }

  async deleteColor(id: number) {
    const { deletedCount } = await this.colorModel.deleteOne({ _id: id });

    return deletedCount > 0;
  }
}
