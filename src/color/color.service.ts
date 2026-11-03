import { DISCORD_COLOR_GROUPS, DISCORD_COLORS, DiscordColor } from './colors';
import { ColorRoleService } from './color-role.service';
import { Injectable, Logger } from '@nestjs/common';
import { ColorMenuMode, getPageCount, renderGroupPage, renderIntro } from './color-menu.renderer';
import { DiscordCommand } from '../discord/discord-command';
import {
  ChatInputCommandInteraction,
  InteractionContextType,
  MessageComponentInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';

const MENU_IDLE_TIMEOUT = 5 * 60 * 1000;

@Injectable()
export class ColorService {
  private readonly logger = new Logger(ColorService.name);
  private readonly logError = (error: Error) => this.logger.error(error.message, error.stack);

  readonly commands: DiscordCommand[] = [
    {
      data: new SlashCommandBuilder()
        .setName('color-list')
        .setDescription('Browse all available colors by group')
        .setContexts(InteractionContextType.Guild),
      execute: (interaction) => this.showColors(interaction, 'apply'),
    },
    {
      data: new SlashCommandBuilder()
        .setName('color-create')
        .setDescription('Create color roles from the color list')
        .setContexts(InteractionContextType.Guild),
      execute: (interaction) => this.showColors(interaction, 'create'),
    },
    {
      data: new SlashCommandBuilder()
        .setName('color-reset')
        .setDescription('Remove all of your color roles')
        .setContexts(InteractionContextType.Guild),
      execute: (interaction) => this.clearColors(interaction),
    },
  ];

  constructor(private readonly colorRole: ColorRoleService) {}

  private async showColors(interaction: ChatInputCommandInteraction, mode: ColorMenuMode) {
    const currentColor = interaction.inCachedGuild() ? this.colorRole.getCurrentColor(interaction.member) : undefined;

    const response = await interaction.reply({
      ...renderIntro(mode, currentColor),
      flags: MessageFlags.Ephemeral,
      withResponse: true,
    });

    let group = DISCORD_COLOR_GROUPS[0];
    let page = 0;
    let latestInteraction: ChatInputCommandInteraction | MessageComponentInteraction = interaction;

    const collector = response.resource?.message?.createMessageComponentCollector({ idle: MENU_IDLE_TIMEOUT });

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
          ? DISCORD_COLORS[Math.floor(Math.random() * DISCORD_COLORS.length)]
          : component.isStringSelectMenu() && component.customId === 'pick-color'
            ? DISCORD_COLORS.find(({ name }) => name === component.values[0])
            : undefined;

      if (chosenColor) {
        collector.stop('closed');
        this.runColorAction(component, chosenColor, mode).catch(this.logError);

        return;
      }

      latestInteraction = component;

      if (component.isStringSelectMenu()) {
        group = DISCORD_COLOR_GROUPS.find(({ name }) => name === component.values[0]) ?? group;
        page = 0;
      } else {
        const nextPage = page + (component.customId === 'next-page' ? 1 : -1);
        page = Math.min(Math.max(nextPage, 0), getPageCount(group) - 1);
      }

      try {
        component.update(renderGroupPage(mode, group, page)).catch(this.logError);
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

  private async runColorAction(component: MessageComponentInteraction, color: DiscordColor, mode: ColorMenuMode) {
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
