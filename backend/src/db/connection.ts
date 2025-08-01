import { Pool, PoolConfig } from 'pg';  
import dotenv from 'dotenv'; 

dotenv.config(); // Loading environment variables

let config: PoolConfig; 

if (process.env.DATABASE_URL) {
    // If DATABASE_URL is set (yes, in production on Render)
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

