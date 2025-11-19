import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

/**
 * Database migration runner
 */
export class MigrationRunner {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Run all pending migrations
   */
  async runMigrations(): Promise<void> {
    try {
      // Create migrations table if it doesn't exist
      await this.createMigrationsTable();

      // Get list of migration files
      const migrationFiles = await this.getMigrationFiles();
      
      // Get executed migrations
      const executedMigrations = await this.getExecutedMigrations();

      // Run pending migrations
      for (const file of migrationFiles) {
        if (!executedMigrations.includes(file)) {
          console.log(`Running migration: ${file}`);
          await this.runMigration(file);
          await this.recordMigration(file);
          console.log(`Completed migration: ${file}`);
        }
      }

      console.log('All migrations completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  /**
   * Create migrations tracking table
   */
  private async createMigrationsTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await this.pool.query(query);
  }

  /**
   * Get list of migration files
   */
  private async getMigrationFiles(): Promise<string[]> {
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir);
    
    return files
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ensure migrations run in order
  }

  /**
   * Get list of executed migrations
   */
  private async getExecutedMigrations(): Promise<string[]> {
    const query = 'SELECT filename FROM migrations ORDER BY executed_at';
    const result = await this.pool.query(query);
    
    return result.rows.map(row => row.filename);
  }

  /**
   * Run a single migration
   */
  private async runMigration(filename: string): Promise<void> {
    const migrationPath = path.join(__dirname, 'migrations', filename);
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute migration in a transaction
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      await client.query(migrationSQL);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Record migration as executed
   */
  private async recordMigration(filename: string): Promise<void> {
    const query = 'INSERT INTO migrations (filename) VALUES ($1)';
    await this.pool.query(query, [filename]);
  }

  /**
   * Rollback last migration (for development)
   */
  async rollbackLastMigration(): Promise<void> {
    const query = `
      SELECT filename FROM migrations 
      ORDER BY executed_at DESC 
      LIMIT 1
    `;
    
    const result = await this.pool.query(query);
    
    if (result.rows.length === 0) {
      console.log('No migrations to rollback');
      return;
    }

    const lastMigration = result.rows[0].filename;
    console.log(`Rolling back migration: ${lastMigration}`);

    // Remove from migrations table
    await this.pool.query('DELETE FROM migrations WHERE filename = $1', [lastMigration]);
    
    console.log(`Rollback completed for: ${lastMigration}`);
    console.log('Note: You may need to manually undo database changes');
  }
}