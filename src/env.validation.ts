export interface EnvConfig {
  DISCORD_TOKEN: string;
  MONGODB_URI: string;
  API_KEY: string;
  PORT: number;
  API_PREFIX: string;
  BOT_CHANNEL_NAME: string;
  COLOR_ROLE_PREFIX: string;
  COLORS_PER_PAGE: number;
  COLOR_MENU_TIMEOUT_SECONDS: number;
}

const readRequiredText = (config: Record<string, unknown>, name: keyof EnvConfig) => {
  const value = config[name];

  if (typeof value !== 'string' || !value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
};

const readWholeNumber = (
  config: Record<string, unknown>,
  name: keyof EnvConfig,
  fallback: number,
  min: number,
  max: number,
) => {
  const raw = config[name];

  if (raw === undefined || raw === '') {
    return fallback;
  }

  const value = Number(raw);

  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${name} must be a whole number from ${min} to ${max}`);
  }

  return value;
};

export const validateEnv = (config: Record<string, unknown>): EnvConfig => {
  const colorRolePrefix = typeof config.COLOR_ROLE_PREFIX === 'string' ? config.COLOR_ROLE_PREFIX : 'Color ';

  if (!colorRolePrefix.trim()) {
    throw new Error('COLOR_ROLE_PREFIX must not be empty');
  }

  return {
    DISCORD_TOKEN: readRequiredText(config, 'DISCORD_TOKEN'),
    MONGODB_URI: readRequiredText(config, 'MONGODB_URI'),
    API_KEY: readRequiredText(config, 'API_KEY'),
    PORT: readWholeNumber(config, 'PORT', 3000, 1, 65535),
    API_PREFIX:
      typeof config.API_PREFIX === 'string' && config.API_PREFIX.trim()
        ? config.API_PREFIX.trim().replace(/^\/+|\/+$/g, '')
        : 'api',
    BOT_CHANNEL_NAME: typeof config.BOT_CHANNEL_NAME === 'string' ? config.BOT_CHANNEL_NAME : 'colors',
    COLOR_ROLE_PREFIX: colorRolePrefix,
    COLORS_PER_PAGE: readWholeNumber(config, 'COLORS_PER_PAGE', 6, 1, 25),
    COLOR_MENU_TIMEOUT_SECONDS: readWholeNumber(config, 'COLOR_MENU_TIMEOUT_SECONDS', 300, 10, 840),
  };
};
