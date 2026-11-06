import { DatabaseMigration } from '../umzug';

export const caseInsensitiveColorNames: DatabaseMigration = {
  name: '003-case-insensitive-color-names',
  async up({ context: connection }) {
    const colors = connection.db!.collection('colors');

    await colors.dropIndex('name_1');
    await colors.createIndex({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });
  },
  async down({ context: connection }) {
    const colors = connection.db!.collection('colors');

    await colors.dropIndex('name_1');
    await colors.createIndex({ name: 1 }, { unique: true });
  },
};
