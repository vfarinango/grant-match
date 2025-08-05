import { Pool, PoolConfig, types } from 'pg';  
import dotenv from 'dotenv'; 

dotenv.config(); // Loading environment variables

// Incoming convert: Parse vector strings back to JS arrays
const PGVECTOR_OID = 3375;
types.setTypeParser(PGVECTOR_OID as any, (val: string) => {
  // val comes in as a string like "[1.2,3.4,5.6]"
  // This will convert it back into a JS number array
  return val.substring(1, val.length - 1).split(',').map(Number);
});


let config: PoolConfig; 

if (process.env.DATABASE_URL) {
    // If DATABASE_URL is set 
    config = {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false // Use this to enable SSL if Render requires it when testing locally
        }
    };
  } else {
      // Fallback to individual parameters for local development (if DATABASE_URL is not set)
      config = {
          user: process.env.PG_USER,
          host: process.env.PG_HOST,
          database: process.env.PG_DATABASE,
          password: process.env.PG_PASSWORD,
          port: parseInt(process.env.PG_PORT || '5432', 10),
      };
}

// Add common pool options
config.max = 20;
config.idleTimeoutMillis = 30000;

const pool = new Pool(config);

// Error handling for the pool
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err: Error) => {
  console.error('Database connection error:', err);
});

export default pool; 

