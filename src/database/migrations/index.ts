import { DatabaseMigration } from '../umzug';
import { createColorCollections } from './001-create-color-collections';

export const MIGRATIONS: DatabaseMigration[] = [createColorCollections];
