import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Color } from '../schemas/color.schema';

@Injectable()
export class ColorRepository {
  constructor(@InjectModel(Color.name) private readonly colorModel: Model<Color>) {}

  findFirstColorByNames(names: string[]) {
    return this.colorModel
      .findOne({ name: { $in: names } })
      .sort({ _id: 1 })
      .lean();
  }
}
