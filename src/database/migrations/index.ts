import { DatabaseMigration } from '../umzug';
import { createColorCollections } from './001-create-color-collections';
import { caseInsensitiveColorGroupNames } from './002-case-insensitive-color-group-names';
import { caseInsensitiveColorNames } from './003-case-insensitive-color-names';
import { createBotResponsesCollection } from './004-create-bot-responses-collection';

export const MIGRATIONS: DatabaseMigration[] = [
  createColorCollections,
  caseInsensitiveColorGroupNames,
  caseInsensitiveColorNames,
  createBotResponsesCollection,
];
