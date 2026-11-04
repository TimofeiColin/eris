import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { BotModule } from './bot/bot.module';
import { DatabaseModule } from './database/database.module';
import { validateEnv } from './env.validation';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }), DatabaseModule, BotModule],
})
export class AppModule {}
