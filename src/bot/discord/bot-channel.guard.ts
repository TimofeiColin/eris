import { ChatInputCommandInteraction } from 'discord.js';

export const findRequiredBotChannel = (interaction: ChatInputCommandInteraction, channelName: string) => {
  if (!channelName) {
    return undefined;
  }

  const botChannel = interaction.guild?.channels.cache.find(
    (channel) => channel.name === channelName && channel.isTextBased(),
  );

  if (!botChannel) {
    return undefined;
  }

  const threadParentId = interaction.channel?.isThread() ? interaction.channel.parentId : null;
  const isInBotChannel = [interaction.channelId, threadParentId].includes(botChannel.id);

  return isInBotChannel ? undefined : botChannel;
};
