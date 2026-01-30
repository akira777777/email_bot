import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true
  }
});

// Test connection
pool.connect()
  .then(() => console.log('Connected to Neon Postgres'))
  .catch(err => console.error('Database connection error', err));

export const query = (text, params) => pool.query(text, params);
export default pool;
