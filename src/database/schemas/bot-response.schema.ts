import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'bot_responses', versionKey: false })
export class BotResponse {
  @Prop({ type: Number, required: true })
  _id!: number;

  @Prop({ type: String, required: true, trim: true })
  command!: string;

  @Prop({ type: [String], default: [] })
  responses!: string[];
}

export const BotResponseSchema = SchemaFactory.createForClass(BotResponse);

BotResponseSchema.index({ command: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });
