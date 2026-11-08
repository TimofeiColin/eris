import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, Events, GatewayIntentBits, Interaction, MessageFlags, RESTEvents } from 'discord.js';

import type { EnvConfig } from '../../env.validation';
import { ColorService } from '../color/color.service';
import { HelpService } from '../help/help.service';
import { PingService } from '../ping/ping.service';
import { ResponseService } from '../response/response.service';
import { createErrorLogger } from '../utils';
import { findRequiredBotChannel } from './bot-channel.guard';
import { areCommandsRegistered, toCommandData } from './command-registration';
import { DiscordCommand } from './discord-command';

const MAX_RATE_LIMIT_WAIT = 60 * 1000;

@Injectable()
export class DiscordService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(DiscordService.name);
  private readonly logError = createErrorLogger(this.logger);

  private readonly client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    rest: { rejectOnRateLimit: ({ retryAfter }) => retryAfter > MAX_RATE_LIMIT_WAIT },
  });

  private readonly commands: DiscordCommand[];

  constructor(
    private readonly config: ConfigService<EnvConfig, true>,
    helpService: HelpService,
    pingService: PingService,
    colorService: ColorService,
    private readonly responseService: ResponseService,
  ) {
    this.commands = [...helpService.commands, ...pingService.commands, ...colorService.commands];
  }

  async onApplicationBootstrap() {
    this.client.once(Events.ClientReady, (client) => {
      this.logger.log(`Logged in as ${client.user.tag}`);
      this.registerCommands(client).catch(this.logError);
    });

    this.client.on(Events.Error, this.logError);

    this.client.rest.on(RESTEvents.RateLimited, ({ method, route, retryAfter }) => {
      this.logger.warn(`Rate limited on ${method} ${route}, retry after ${Math.ceil(retryAfter / 1000)}s`);
    });

    this.client.on(Events.InteractionCreate, (interaction) => {
      this.handleInteraction(interaction).catch(this.logError);
    });

    this.client.on(Events.MessageCreate, (message) => {
      this.responseService.handleMessage(message).catch(this.logError);
    });

    await this.client.login(this.config.getOrThrow('DISCORD_TOKEN', { infer: true }));
  }

  async onApplicationShutdown() {
    await this.client.destroy();
  }

  private async handleInteraction(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    const botChannel = findRequiredBotChannel(interaction, this.config.getOrThrow('BOT_CHANNEL_NAME', { infer: true }));

    if (botChannel) {
      await interaction.reply({
        content: `I only work in <#${botChannel.id}>, please use me there.`,
        flags: MessageFlags.Ephemeral,
      });

      return;
    }

    const command = this.commands.find(({ data }) => data.name === interaction.commandName);
    await command?.execute(interaction, this.commands);
  }

  private async registerCommands(client: Client<true>) {
    const commands = this.commands.map(({ data }) => toCommandData(data));
    const registered = await client.application.commands.fetch();

    if (areCommandsRegistered([...registered.values()], commands)) {
      return;
    }

    await client.application.commands.set(commands);
    this.logger.log(`Registered ${commands.length} commands`);
  }
}
