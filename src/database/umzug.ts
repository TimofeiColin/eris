import { Logger } from '@nestjs/common';
import { Connection } from 'mongoose';
import { MongoDBStorage, RunnableMigration, Umzug } from 'umzug';

export type DatabaseMigration = RunnableMigration<Connection>;

export const createUmzug = (connection: Connection, collectionName: string, migrations: DatabaseMigration[]) => {
  const logger = new Logger(collectionName);

  return new Umzug({
    migrations,
    context: connection,
    storage: new MongoDBStorage({ collection: connection.db!.collection(collectionName) }),
    logger: {
      info: ({ event, name }) => logger.log(`${String(event)} ${String(name)}`),
      warn: (message) => logger.warn(message),
      error: (message) => logger.error(message),
      debug: (message) => logger.debug(message),
    },
  });
};
