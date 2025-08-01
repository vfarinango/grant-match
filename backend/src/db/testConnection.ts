import pool from './connection';

async function testConnection() {
    try {
        console.log('Testing database connection...');
        
        // Test basic connection
        const result = await pool.query('SELECT NOW(), current_database(), current_user');
        
        console.log('✅ Connected successfully!');
        console.log('📅 Current time:', result.rows[0].now);
        console.log('🗄️ Database name:', result.rows[0].current_database);
        console.log('👤 Connected as:', result.rows[0].current_user);
        
        // Check if this is local or remote
        const hostResult = await pool.query('SELECT inet_server_addr()');
        const serverIP = hostResult.rows[0].inet_server_addr;
        
        if (serverIP === null || serverIP === '127.0.0.1' || serverIP === '::1') {
            console.log('🏠 Connected to LOCAL database');
        } else {
            console.log('☁️ Connected to REMOTE database:', serverIP);
        }
        
    } catch (error: any) {
        console.error('❌ Connection failed:', error.message);
        
        if (error.code === 'ENOTFOUND') {
            console.log('💡 Tip: Make sure PostgreSQL is running locally');
        } else if (error.code === '3D000') {
            console.log('💡 Tip: Database doesn\'t exist. Run: createdb grant_match_development');
        } else if (error.code === '28P01') {
            console.log('💡 Tip: Check your username/password in .env');
        }
    } finally {
        await pool.end();
    }
}

testConnection();