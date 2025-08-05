import pool from '../src/db/connection';
import grantsToSeed from './seedData';
import { Grant } from '../src/routes/grantsRoutes';

async function seedDatabase() {
    console.log('Seeding database with new grants...');
    try {
        for (const grantData of grantsToSeed) {
            // Note: The returning 'id' clause is optional, but useful for verification
            await pool.query(
                `INSERT INTO grants (title, description, deadline, funding_amount, source, source_url, focus_areas, posted_date)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [
                    grantData.title, grantData.description, grantData.deadline, grantData.funding_amount,
                    grantData.source, grantData.source_url, grantData.focus_areas, grantData.posted_date
                ]
            );
            console.log(`Inserted new grant: ${grantData.title}`);
        }
        console.log('Database seeding complete!');
    } catch (error: any) {
        console.error('Database seeding error:', error);
    } finally {
        await pool.end();
    }
}

seedDatabase();