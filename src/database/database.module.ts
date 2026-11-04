import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import type { EnvConfig } from '../env.validation';
import { ColorGroupRepository, ColorRepository } from './repositories';
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
    ]),
  ],
  providers: [ColorRepository, ColorGroupRepository],
  exports: [ColorRepository, ColorGroupRepository],
})
export class DatabaseModule {}
