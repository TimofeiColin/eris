import { DatabaseMigration } from '../umzug';

export const createColorCollections: DatabaseMigration = {
  name: '001-create-color-collections',
  async up({ context: connection }) {
    const db = connection.db!;

    await db.createCollection('color_groups');
    await db.collection('color_groups').createIndex({ name: 1 }, { unique: true });

    await db.createCollection('colors');
    await db.collection('colors').createIndex({ name: 1 }, { unique: true });
    await db.collection('colors').createIndex({ group: 1 });
  },
  async down({ context: connection }) {
    await connection.db!.dropCollection('colors');
    await connection.db!.dropCollection('color_groups');
  },
};
