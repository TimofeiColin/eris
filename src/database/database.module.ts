import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import type { EnvConfig } from '../env.validation';
import { BotResponseRepository, ColorGroupRepository, ColorRepository } from './repositories';
import { BotResponse, BotResponseSchema } from './schemas/bot-response.schema';
import { Color, ColorSchema } from './schemas/color.schema';
import { ColorGroup, ColorGroupSchema } from './schemas/color-group.schema';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvConfig, true>) => ({
        uri: config.getOrThrow('MONGODB_URI', { infer: true }),
        autoIndex: false,
      }),
    }),
    MongooseModule.forFeature([
      { name: ColorGroup.name, schema: ColorGroupSchema },
      { name: Color.name, schema: ColorSchema },
      { name: BotResponse.name, schema: BotResponseSchema },
    ]),
  ],
  providers: [ColorRepository, ColorGroupRepository, BotResponseRepository],
  exports: [ColorRepository, ColorGroupRepository, BotResponseRepository],
})
export class DatabaseModule {}
