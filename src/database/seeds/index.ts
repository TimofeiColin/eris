import { DatabaseMigration } from '../umzug';
import { seedColors } from './001-colors';

export const SEEDS: DatabaseMigration[] = [seedColors];
