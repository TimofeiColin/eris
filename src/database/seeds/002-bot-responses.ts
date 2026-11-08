import { BotResponse, BotResponseSchema } from '../schemas/bot-response.schema';
import { DatabaseMigration } from '../umzug';

const BOT_RESPONSES = [
  { command: 'hello', responses: ['Hi!', 'Hey there!', 'Hello 👋'] },
  { command: 'good morning', responses: ['Good morning! ☀️', 'Rise and shine!'] },
  { command: 'good night', responses: ['Good night! 🌙', 'Sleep well!', 'Sweet dreams 💤'] },
];

const seeded = BOT_RESPONSES.map((response, index) => ({ _id: index + 1, ...response }));

export const seedBotResponses: DatabaseMigration = {
  name: '002-bot-responses',
  async up({ context: connection }) {
    await connection
      .model(BotResponse.name, BotResponseSchema)
      .bulkWrite(
        seeded.map(({ _id, ...response }) => ({ updateOne: { filter: { _id }, update: response, upsert: true } })),
      );
  },
  async down({ context: connection }) {
    await connection
      .model(BotResponse.name, BotResponseSchema)
      .deleteMany({ _id: { $in: seeded.map(({ _id }) => _id) } });
  },
};
