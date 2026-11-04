import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

import { DatabaseModule } from './database.module';
import { MIGRATIONS } from './migrations';
import { SEEDS } from './seeds';
import { createUmzug } from './umzug';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule],
})
class DatabaseCliModule {}

async function run() {
  const [command, direction = 'up'] = process.argv.slice(2);
  const app = await NestFactory.createApplicationContext(DatabaseCliModule, { logger: ['log', 'warn', 'error'] });
  const connection = app.get<Connection>(getConnectionToken());
  const migrations = createUmzug(connection, 'migrations', MIGRATIONS);
  const seeds = createUmzug(connection, 'seeds', SEEDS);

  try {
    if (command === 'migrate') {
      await (direction === 'down' ? migrations.down() : migrations.up());
    } else if (command === 'seed') {
      if (direction === 'down') {
        await seeds.down();
      } else {
        await migrations.up();
        await seeds.up();
      }
    } else {
      throw new Error(`Unknown command "${command}", expected "migrate" or "seed"`);
    }
  } finally {
    await app.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
