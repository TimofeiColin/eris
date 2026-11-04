import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Color } from '../schemas/color.schema';

@Injectable()
export class ColorRepository {
  constructor(@InjectModel(Color.name) private readonly colorModel: Model<Color>) {}

  countColors() {
    return this.colorModel.countDocuments();
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
}
