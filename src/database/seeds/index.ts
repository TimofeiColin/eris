import { DatabaseMigration } from '../umzug';
import { seedColors } from './001-colors';
import { seedBotResponses } from './002-bot-responses';

export const SEEDS: DatabaseMigration[] = [seedColors, seedBotResponses];
