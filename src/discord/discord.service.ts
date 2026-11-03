import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { ColorService } from '../color/color.service';
import { HelpService } from '../help/help.service';
import { PingService } from '../ping/ping.service';
import { ConfigService } from '@nestjs/config';
import { findRequiredBotChannel } from './bot-channel.guard';
import { DiscordCommand } from './discord-command';
import {
  ApplicationCommandData,
  ApplicationIntegrationType,
  Client,
  Events,
  GatewayIntentBits,
  Interaction,
  MessageFlags,
  RESTEvents,
} from 'discord.js';

const MAX_RATE_LIMIT_WAIT = 60 * 1000;

@Injectable()
export class DiscordService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(DiscordService.name);
  private readonly logError = (error: Error) => this.logger.error(error.message, error.stack);

  private readonly client = new Client({
    intents: [GatewayIntentBits.Guilds],
    rest: { rejectOnRateLimit: ({ retryAfter }) => retryAfter > MAX_RATE_LIMIT_WAIT },
  });

  private readonly commands: DiscordCommand[];

  constructor(
    private readonly config: ConfigService,
    helpService: HelpService,
    pingService: PingService,
    colorService: ColorService,
  ) {
    this.commands = [...helpService.commands, ...pingService.commands, ...colorService.commands];
    this.commands.forEach(({ data }) => data.setIntegrationTypes(ApplicationIntegrationType.GuildInstall));
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

    await this.client.login(this.config.getOrThrow<string>('DISCORD_TOKEN'));
  }

  async onApplicationShutdown() {
    await this.client.destroy();
  }

  private async handleInteraction(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    const botChannel = findRequiredBotChannel(interaction);

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
    const commands = this.commands.map(
      ({ data }) =>
        JSON.parse(
          JSON.stringify(data, (_, value: unknown) => (Array.isArray(value) && !value.length ? undefined : value)),
        ) as ApplicationCommandData,
    );
    const registered = await client.application.commands.fetch();
    const isUpToDate =
      registered.size === commands.length &&
      commands.every((command) => registered.find(({ name }) => name === command.name)?.equals(command));

    if (isUpToDate) {
      return;
    }

    await client.application.commands.set(commands);
    this.logger.log(`Registered ${commands.length} commands`);
  }
}
