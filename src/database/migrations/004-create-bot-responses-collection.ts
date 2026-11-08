import { DatabaseMigration } from '../umzug';

export const createBotResponsesCollection: DatabaseMigration = {
  name: '004-create-bot-responses-collection',
  async up({ context: connection }) {
    const db = connection.db!;

    await db.createCollection('bot_responses');
    await db
      .collection('bot_responses')
      .createIndex({ command: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });
  },
  async down({ context: connection }) {
    await connection.db!.dropCollection('bot_responses');
  },
};
