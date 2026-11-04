import { ApplicationCommand, ApplicationCommandData, SlashCommandBuilder } from 'discord.js';

const removeEmptyArrays = (_key: string, value: unknown) => (Array.isArray(value) && !value.length ? undefined : value);

export const toCommandData = (data: SlashCommandBuilder) =>
  JSON.parse(JSON.stringify(data, removeEmptyArrays)) as ApplicationCommandData;

export const areCommandsRegistered = (registered: ApplicationCommand[], commands: ApplicationCommandData[]) =>
  registered.length === commands.length &&
  commands.every((command) => registered.find(({ name }) => name === command.name)?.equals(command));
