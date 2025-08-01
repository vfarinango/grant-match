import pool from './connection'; 
import fs from 'fs';
import path from 'path';

async function setupDatabase() {
    try {
        console.log('Setting up database...');

        // Read and execute schema
        const schemaPath = path.join(__dirname, 'schema.sql');
        console.log('Reading schema from:', schemaPath);

        if (!fs.existsSync(schemaPath)) {
            throw new Error(`Schema file not found at: ${schemaPath}`);
        }

        const schema = fs.readFileSync(schemaPath, 'utf8');

        // --- CORRECTED: Split the schema into individual queries and execute them ---
        const queries = schema
            .split(';')
            .map(q => q.trim())
            .filter(q => q.length > 0)
            .filter(q => !q.startsWith('--')); // Remove comment-only lines

        console.log(`Found ${queries.length} SQL commands to execute`);
        
        // Execute each query
        for (let i = 0; i < queries.length; i++) {
            const query = queries[i];
            console.log(`Executing query ${i + 1}/${queries.length}...`);

            try {
                await pool.query(query);
                console.log(`✓ Query ${i + 1} executed successfully`);
            } catch (queryError: any) {
                console.error(`✗ Error executing query ${i + 1}:`, queryError.message);
                console.error('Failed query:', query.substring(0, 100) + '...');
                throw queryError; // Re-throw to stop execution
            }
        }

        console.log('Database schema created successfully!');

        // Test with a simple query
        const result = await pool.query('SELECT NOW()');
        console.log('Database connection test successful:', result.rows[0].now);
        
        // Verify tables were created
        const tablesResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        console.log('✓ Tables created:', tablesResult.rows.map(row => row.table_name));
    } catch (error: any) {
        console.error('Database setup error:', error.message);
        process.exit(1);
    } finally {
        // Ensure the pool ends after setup, as this is a one-off script
        await pool.end();
        console.log('Database connection closed.');
    }
}

setupDatabase();