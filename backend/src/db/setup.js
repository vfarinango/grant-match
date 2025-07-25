const pool = require('./connection'); // Path to connection.js
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
    try {
        console.log('Setting up database...');

        // Read and execute schema
        const schemaPath = path.join(__dirname, 'schema.sql'); // Path to schema.sql
        const schema = fs.readFileSync(schemaPath, 'utf8');

        await pool.query(schema);
        console.log('Database schema created successfully!');

        // Test with a simple query
        const result = await pool.query('SELECT NOW()');
        console.log('Database connection test successful:', result.rows[0].now);

    } catch (error) {
        console.error('Database setup error:', error);
    } finally {
        // Ensure the pool ends after setup, as this is a one-off script
        await pool.end();
    }
}

// Run setup
setupDatabase();