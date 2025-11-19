#!/usr/bin/env node

import { getPool, connectDatabase } from '../config/database';
import { MigrationRunner } from '../database/migrate';

async function main() {
  const command = process.argv[2];
  
  if (!command || !['up', 'rollback'].includes(command)) {
    console.log('Usage: npm run migrate [up|rollback]');
    console.log('  up       - Run all pending migrations');
    console.log('  rollback - Rollback the last migration');
    process.exit(1);
  }

  try {
    console.log('Connecting to database...');
    await connectDatabase();
    const pool = getPool();
    const migrationRunner = new MigrationRunner(pool);

    if (command === 'up') {
      console.log('Running migrations...');
      await migrationRunner.runMigrations();
    } else if (command === 'rollback') {
      console.log('Rolling back last migration...');
      await migrationRunner.rollbackLastMigration();
    }

    await pool.end();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();