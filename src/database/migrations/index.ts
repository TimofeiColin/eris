import { DatabaseMigration } from '../umzug';
import { createColorCollections } from './001-create-color-collections';
import { caseInsensitiveColorGroupNames } from './002-case-insensitive-color-group-names';

export const MIGRATIONS: DatabaseMigration[] = [createColorCollections, caseInsensitiveColorGroupNames];
