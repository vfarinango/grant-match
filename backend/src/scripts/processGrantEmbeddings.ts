import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import OpenAI from 'openai';
import pool from '../db/connection';
import { Grant } from '../types/grantMatchTypes';

const openai = new OpenAI();

// --- Get embedding for a given text. Template OpenAI code --- 

async function getEmbedding(text: string): Promise<number[]> {
    try {
        const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        encoding_format: "float",
    });
    return response.data[0].embedding;
    } catch (error: any) {
        console.error(`Error generating embedding for text: "${text.substring(0, 50)}..."`, error);
        throw error; 
    }
}

// --- Main function to generate and update grant embeddings seed data ---

async function generateAndStoreGrantEmbeddings() {
    console.log('Starting grant embedding generation...');

    try {
        // Fetch grants that DONT have a full_text embedding
        const res = await pool.query<Grant>(`
            SELECT g.id, g.title, g.description, g.focus_areas
            FROM grants g
            LEFT JOIN grant_embeddings ge ON g.id = ge.grant_id AND ge.embedding_type = 'full_text'
            WHERE ge.id IS NULL
        `);
        const grantsToEmbed = res.rows;
    
        if (grantsToEmbed.length === 0) {
            console.log('No grants found without embeddings. Exiting.')
            return;
        }

        console.log(`Found ${grantsToEmbed.length} grants to embed.`); 

        // Loop through each grant and generate its embedding
        for (const grant of grantsToEmbed) {
            const grantTextToEmbed = `${grant.title} ${grant.description} ${grant.focus_areas ? grant.focus_areas.join(' ') : ''}`;

            if (!grantTextToEmbed.trim()) {
                console.warn(`Skipping grant ID ${grant.id} due to empty text for embedding.`);
                continue;
            }

            console.log(`Processing grant ID ${grant.id}: "${grant.title}"`); // progress logging

            try {
                const embedding = await getEmbedding(grantTextToEmbed);

                // INSERT into the new table with all required fields
                await pool.query(
                    `INSERT INTO grant_embeddings (grant_id, embedding_type, embedding, model_version) VALUES ($1, $2, $3::vector, $4)`,
                    [grant.id, 'full_text', `[${embedding.join(',')}]`, 'text-embedding-3-small'] 
                );
                console.log(`✅ Successfully embedded and inserted grant ID: ${grant.id}`);
            } catch (innerError: any) {
                console.error(`❌ Failed to embed or insert for grant ID ${grant.id}:`, innerError.message);
                // Continue to the next grant even if one fails
            }
        } 

        console.log('🎉 Grant embedding generation complete.');
    } catch (error: any) {
        console.error('An error occurred during the embedding process:', error.message);
    } finally {
        // 4. Close the database connection pool
        await pool.end(); // Important to close the pool when the script finishes
        console.log('Database connection pool closed.');
    }  
}

// Execute the main function
generateAndStoreGrantEmbeddings();


// // DO NOT RUN YET --- URGENT REFACTOR:
// // set up db with migrations folder (just in case)
// // Using current db:
//     // update grants table to remove embedding VECTOR(1536)
//     // create new vector-embeddings table in db for vector embeddings
//     // set up grant id as FK to vector-embeddings table
