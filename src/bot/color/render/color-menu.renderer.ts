import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder,
} from 'discord.js';

import { ColorGroupView, ColorMenuMode, ColorOption } from '../types';
import { renderColorCard } from './color-card';

export const getPageCount = ({ colors }: ColorGroupView, colorsPerPage: number) =>
  Math.ceil(colors.length / colorsPerPage);

const renderGroupMenu = (groups: ColorGroupView[], selected?: ColorGroupView) =>
  new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('color-group')
      .setPlaceholder('Choose a color group')
      .addOptions(
        groups.map((group) => ({
          label: group.name,
          value: group.name,
          description: `${group.colors.length} colors`,
          default: group === selected,
        })),
      ),
  );

const renderButtons = (mode: ColorMenuMode, page = 0, pageCount = 0) => {
  const randomButton = new ButtonBuilder()
    .setCustomId('random-color')
    .setLabel('Random')
    .setEmoji('🎲')
    .setStyle(ButtonStyle.Primary);

  const closeButton = new ButtonBuilder()
    .setCustomId('close')
    .setLabel('Close')
    .setEmoji('✖️')
    .setStyle(ButtonStyle.Danger);

  const extraButtons = mode === 'apply' ? [randomButton, closeButton] : [closeButton];

  if (!pageCount) {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(...extraButtons);
  }

  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('previous-page')
      .setEmoji('◀️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),
    new ButtonBuilder()
      .setCustomId('next-page')
      .setEmoji('▶️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === pageCount - 1),
    ...extraButtons,
  );
};

export const renderIntro = (mode: ColorMenuMode, groups: ColorGroupView[], currentColor?: ColorOption) => {
  const colorCount = groups.reduce((total, { colors }) => total + colors.length, 0);
  const currentColorText = currentColor
    ? `Your current color is **${currentColor.name}**.`
    : "You don't have a color yet.";

  const embed =
    mode === 'apply'
      ? new EmbedBuilder()
          .setTitle('🎨 Colors')
          .setDescription(
            `${currentColorText}\n\nChoose a group below to see its colors. There are ${colorCount} in total.`,
          )
          .setColor(currentColor?.value ?? null)
      : new EmbedBuilder()
          .setTitle('🛠️ Create color roles')
          .setDescription('Choose a group below, then pick a color to create its role.');

  return { embeds: [embed], components: [renderGroupMenu(groups), renderButtons(mode)] };
};

export const renderGroupPage = (
  mode: ColorMenuMode,
  groups: ColorGroupView[],
  group: ColorGroupView,
  page: number,
  colorsPerPage: number,
) => {
  const { name, colors } = group;
  const pageCount = getPageCount(group, colorsPerPage);
  const pageColors = colors.slice(page * colorsPerPage, (page + 1) * colorsPerPage);
  const card = new AttachmentBuilder(renderColorCard(pageColors), { name: 'colors.png' });

  const embed = new EmbedBuilder()
    .setTitle(name)
    .setImage('attachment://colors.png')
    .setColor(pageColors[0].value)
    .setFooter({ text: `Page ${page + 1}/${pageCount} • ${colors.length} colors` });

  const colorMenu = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('pick-color')
      .setPlaceholder(mode === 'apply' ? 'Choose a color for yourself' : 'Choose a color role to create')
      .addOptions(
        pageColors.map((color) => ({
          label: color.name,
          value: color.name,
          description: color.hex,
        })),
      ),
  );

  return {
    embeds: [embed],
    components: [renderGroupMenu(groups, group), colorMenu, renderButtons(mode, page, pageCount)],
    files: [card],
    attachments: [],
  };
};
