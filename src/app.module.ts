import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscordModule } from './discord/discord.module';
import { validateEnv } from './env.validation';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }), DiscordModule],
})
export class AppModule {}
