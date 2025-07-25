const { Pool } =  require('pg');
require('dotenv').config(); // For loading environment variables

let config;

if (process.env.DATABASE_URL) {
    // If DATABASE_URL is set (e.g., in production on Render, or locally if you choose to use it)
    config = {
        connectionString: process.env.DATABASE_URL,
        // Add SSL configuration for Render if needed, depending on your Render DB settings
        // ssl: {
        //   rejectUnauthorized: false // Use this if Render requires it, but true is more secure
        // }
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

