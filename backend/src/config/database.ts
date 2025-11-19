import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

let pool: Pool;

const dbConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'ecuador_rideshare',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // return an error after 2 seconds if connection could not be established
};

export async function connectDatabase(): Promise<void> {
  try {
    pool = new Pool(dbConfig);
    
    // Test the connection
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database');
    
    // Create basic schema
    await createBasicSchema(client);
    
    client.release();
  } catch (error) {
    console.error('❌ Error connecting to PostgreSQL:', error);
    throw error;
  }
}

async function createBasicSchema(client: any): Promise<void> {
  try {
    // Enable UUID extension
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        profile_photo_url TEXT,
        date_of_birth DATE,
        rating DECIMAL(3,2) DEFAULT 0.00,
        total_trips INTEGER DEFAULT 0,
        verification_status JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database schema initialized');
  } catch (error) {
    console.error('❌ Error creating database schema:', error);
    throw error;
  }
}

export function getPool(): Pool {
  if (!pool) {
    throw new Error('Database pool not initialized. Call connectDatabase() first.');
  }
  return pool;
}

export { pool };

export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    console.log('✅ Database connection closed');
  }
}