import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ChatInputCommandInteraction,
  InteractionContextType,
  MessageComponentInteraction,
  MessageFlags,
} from 'discord.js';

import { createErrorLogger } from '../../common/create-error-logger';
import type { EnvConfig } from '../../env.validation';
import { createSlashCommand, DiscordCommand } from '../discord/discord-command';
import { ColorCatalogService } from './color-catalog.service';
import { ColorRoleService } from './color-role.service';
import { getPageCount, renderGroupPage, renderIntro } from './render';
import { ColorMenuMode, ColorOption } from './types';

@Injectable()
export class ColorService {
  private readonly logger = new Logger(ColorService.name);
  private readonly logError = createErrorLogger(this.logger);

  readonly commands: DiscordCommand[] = [
    {
      data: createSlashCommand()
        .setName('color-list')
        .setDescription('Browse all available colors by group')
        .setContexts(InteractionContextType.Guild),
      execute: (interaction) => this.showColors(interaction, 'apply'),
    },
    {
      data: createSlashCommand()
        .setName('color-create')
        .setDescription('Create color roles from the color list')
        .setContexts(InteractionContextType.Guild),
      execute: (interaction) => this.showColors(interaction, 'create'),
    },
    {
      data: createSlashCommand()
        .setName('color-reset')
        .setDescription('Remove all of your color roles')
        .setContexts(InteractionContextType.Guild),
      execute: (interaction) => this.clearColors(interaction),
    },
  ];

  private readonly colorsPerPage: number;
  private readonly colorMenuTimeoutMs: number;

  constructor(
    config: ConfigService<EnvConfig, true>,
    private readonly colorRole: ColorRoleService,
    private readonly colorCatalog: ColorCatalogService,
  ) {
    this.colorsPerPage = config.getOrThrow('COLORS_PER_PAGE', { infer: true });
    this.colorMenuTimeoutMs = config.getOrThrow('COLOR_MENU_TIMEOUT_SECONDS', { infer: true }) * 1000;
  }

  private async showColors(interaction: ChatInputCommandInteraction, mode: ColorMenuMode) {
    const groups = await this.colorCatalog.getGroupsWithColors();

    if (!groups.length) {
      await interaction.reply({ content: '❌ No colors are set up yet.', flags: MessageFlags.Ephemeral });

      return;
    }

    const colors = groups.flatMap((group) => group.colors);

    const currentColor = interaction.inCachedGuild()
      ? await this.colorRole.getCurrentColor(interaction.member)
      : undefined;

    const response = await interaction.reply({
      ...renderIntro(mode, groups, currentColor),
      flags: MessageFlags.Ephemeral,
      withResponse: true,
    });

    let group = groups[0];
    let page = 0;
    let latestInteraction: ChatInputCommandInteraction | MessageComponentInteraction = interaction;

    const collector = response.resource?.message?.createMessageComponentCollector({
      idle: this.colorMenuTimeoutMs,
    });

    collector?.on('collect', (component) => {
      if (component.customId === 'close') {
        collector.stop('closed');
        component
          .update({ content: '👋 Color menu closed.', embeds: [], components: [], attachments: [] })
          .catch(this.logError);

        return;
      }

      const chosenColor =
        component.customId === 'random-color'
          ? colors[Math.floor(Math.random() * colors.length)]
          : component.isStringSelectMenu() && component.customId === 'pick-color'
            ? colors.find(({ name }) => name === component.values[0])
            : undefined;

      if (chosenColor) {
        collector.stop('closed');
        this.runColorAction(component, chosenColor, mode).catch(this.logError);

        return;
      }

      latestInteraction = component;

      if (component.isStringSelectMenu()) {
        group = groups.find(({ name }) => name === component.values[0]) ?? group;
        page = 0;
      } else {
        const nextPage = page + (component.customId === 'next-page' ? 1 : -1);
        page = Math.min(Math.max(nextPage, 0), getPageCount(group, this.colorsPerPage) - 1);
      }

      try {
        component.update(renderGroupPage(mode, groups, group, page, this.colorsPerPage)).catch(this.logError);
      } catch (error) {
        this.logError(error as Error);
      }
    });

    collector?.on('end', (_, reason) => {
      if (reason !== 'closed') {
        latestInteraction.editReply({ components: [] }).catch(this.logError);
      }
    });
  }

  private async clearColors(interaction: ChatInputCommandInteraction) {
    await interaction.reply({ content: '⏳ Starting...', flags: MessageFlags.Ephemeral });

    const report = async (content: string) => {
      await interaction.editReply({ content });
    };

    if (!interaction.inCachedGuild()) {
      await report('❌ Colors can only be removed inside a server.');

      return;
    }

    try {
      await report(await this.colorRole.clearColors(interaction.member, report));
    } catch (error) {
      this.logError(error as Error);
      await report('❌ Something went wrong while removing your colors, please try again.');
    }
  }

  private async runColorAction(component: MessageComponentInteraction, color: ColorOption, mode: ColorMenuMode) {
    await component.update({ content: '⏳ Starting...', embeds: [], components: [], attachments: [] });

    const report = async (content: string) => {
      await component.editReply({ content });
    };

    if (!component.inCachedGuild()) {
      await report('❌ Colors can only be managed inside a server.');

      return;
    }

    try {
      const result =
        mode === 'apply'
          ? await this.colorRole.applyColor(component.member, color, report)
          : await this.colorRole.createColorRole(component.guild, color, report);
      await report(result);
    } catch (error) {
      this.logError(error as Error);
      await report('❌ Something went wrong, please try again.');
    }
  }
}
