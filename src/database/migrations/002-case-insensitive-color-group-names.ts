import { CASE_INSENSITIVE } from '../case-insensitive';
import { DatabaseMigration } from '../umzug';

export const caseInsensitiveColorGroupNames: DatabaseMigration = {
  name: '002-case-insensitive-color-group-names',
  async up({ context: connection }) {
    const groups = connection.db!.collection('color_groups');

    await groups.dropIndex('name_1');
    await groups.createIndex({ name: 1 }, { unique: true, collation: CASE_INSENSITIVE });
  },
  async down({ context: connection }) {
    const groups = connection.db!.collection('color_groups');

    await groups.dropIndex('name_1');
    await groups.createIndex({ name: 1 }, { unique: true });
  },
};
