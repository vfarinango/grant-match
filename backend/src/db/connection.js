const { Pool } =  require('pg');
require('dotenv').config(); // For loading environment variables

let config;

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
          port: process.env.PG_PORT,
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

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

module.exports = pool;

