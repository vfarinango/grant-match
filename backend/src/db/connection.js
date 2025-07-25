const { Pool } =  require('pg');
require('dotenv').config(); // For loading environment variables

const pool = new Pool ({
    // For production
    connectionString: process.env.DATABASE_URL, 

    // For local development
    user: process.env.PG_USER, 
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE, 
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
    max: 20, // max number of clients in the pool
    idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
});

// Error handling for the pool
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

module.exports = pool;

