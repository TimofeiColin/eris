const REQUIRED_ENV = ['DISCORD_TOKEN'];

export const validateEnv = (config: Record<string, unknown>) => {
  const missing = REQUIRED_ENV.filter((name) => !config[name]);

  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }

  return config;
};
