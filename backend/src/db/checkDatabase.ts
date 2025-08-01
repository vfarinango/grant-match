import pool from './connection'; 

async function checkDatabase() {
    try {
        console.log('Checking current database state...');

        // Check what tables exist
        const tablesResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        
        console.log('\n📊 Existing tables:');
        tablesResult.rows.forEach(row => {
            console.log(`  - ${row.table_name}`);
        });

        // Check table structures
        for (const tableRow of tablesResult.rows) {
            const tableName = tableRow.table_name;
            console.log(`\n🏗️  Structure of '${tableName}' table:`);
            
            const columnsResult = await pool.query(`
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_name = $1 AND table_schema = 'public'
                ORDER BY ordinal_position
            `, [tableName]);

            columnsResult.rows.forEach(col => {
                console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
            });
        }

        // Check foreign key constraints
        const fkResult = await pool.query(`
            SELECT
                tc.table_name, 
                kcu.column_name, 
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name 
            FROM 
                information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
                AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema='public'
        `);

        if (fkResult.rows.length > 0) {
            console.log('\n🔗 Foreign key relationships:');
            fkResult.rows.forEach(fk => {
                console.log(`  - ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
            });
        }

        // Check if pgvector extension is installed
        const extensionResult = await pool.query(`
            SELECT * FROM pg_extension WHERE extname = 'vector'
        `);

        console.log('\n🧩 pgvector extension:', extensionResult.rows.length > 0 ? 'INSTALLED' : 'NOT INSTALLED');

        // Check sample data counts
        for (const tableRow of tablesResult.rows) {
            const tableName = tableRow.table_name;
            const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${tableName}`);
            console.log(`📊 ${tableName}: ${countResult.rows[0].count} rows`);
        }

    } catch (error: any) {
        console.error('❌ Error checking database:', error.message);
    } finally {
        await pool.end();
        console.log('\nDatabase connection closed.');
    }
}

checkDatabase();