import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { ColorGroup } from './color-group.schema';

@Schema({ collection: 'colors', versionKey: false })
export class Color {
  @Prop({ type: Number, required: true })
  _id!: number;

  @Prop({ type: String, required: true, unique: true })
  name!: string;

  @Prop({ type: String, required: true, uppercase: true, match: /^#[0-9A-F]{6}$/ })
  hex!: string;

  @Prop({ type: Number, ref: ColorGroup.name, required: true, index: true })
  group!: number;
}

export const ColorSchema = SchemaFactory.createForClass(Color);
