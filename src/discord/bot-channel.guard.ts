import { ChatInputCommandInteraction } from 'discord.js';

const BOT_CHANNEL_NAME = 'colors';

export const findRequiredBotChannel = (interaction: ChatInputCommandInteraction) => {
  const botChannel = interaction.guild?.channels.cache.find(
    (channel) => channel.name === BOT_CHANNEL_NAME && channel.isTextBased(),
  );

  if (!botChannel) {
    return undefined;
  }

  const threadParentId = interaction.channel?.isThread() ? interaction.channel.parentId : null;
  const isInBotChannel = [interaction.channelId, threadParentId].includes(botChannel.id);

  return isInBotChannel ? undefined : botChannel;
};
