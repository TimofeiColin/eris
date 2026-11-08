import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ApiModule } from './api/api.module';
import { BotModule } from './bot/bot.module';
import { CacheModule } from './cache/cache.module';
import { DatabaseModule } from './database/database.module';
import { validateEnv } from './env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    DatabaseModule,
    CacheModule,
    BotModule,
    ApiModule,
  ],
})
export class AppModule {}
