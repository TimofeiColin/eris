import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'color_groups', versionKey: false })
export class ColorGroup {
  @Prop({ type: Number, required: true })
  _id!: number;

  @Prop({ type: String, required: true })
  name!: string;
}

export const ColorGroupSchema = SchemaFactory.createForClass(ColorGroup);

ColorGroupSchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });
