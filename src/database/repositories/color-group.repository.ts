import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Color } from '../schemas/color.schema';
import { ColorGroup } from '../schemas/color-group.schema';

export type ColorGroupWithColors = ColorGroup & { colors: Color[] };

@Injectable()
export class ColorGroupRepository {
  constructor(
    @InjectModel(ColorGroup.name) private readonly colorGroupModel: Model<ColorGroup>,
    @InjectModel(Color.name) private readonly colorModel: Model<Color>,
  ) {}

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
