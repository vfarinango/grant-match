import pool from '../db/connection';
import { Grant, GrantEmbedding } from '../types/grantMatchTypes';
import { EtlResult } from '../types/etlTypes';
import { GrantsGovDetailsResponse, GrantsGovOpportunity, ConsolidatedGrant } from '../types/grantsGovApiTypes';
import { mapGrantsGovToGrant } from '../../etl/grantsGovIngestion';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


interface ProcessedGrant {
    grant: Omit<Grant, 'id' | 'summary'>;
    embeddings: Omit<GrantEmbedding, 'id' | 'grant_id'>[];
}

export async function processAndLoadGrants(etlResult: EtlResult): Promise<void> {
    const { detailResponses, opportunityData } = etlResult;
    console.log(`🔄 Processing ${detailResponses.length} grants from Grants.gov...`);
    
    // Check for an empty result set before proceeding
    if (detailResponses.length === 0) {
        console.log('⚠️  No grants to process. Exiting.');
        return;
    }

    // Consolidate the two arrays into a single, enriched grants array
    // This part of the code is now more resilient with our refined types.
    const consolidatedGrants: ConsolidatedGrant[] = opportunityData.map(opp => {
        const details = detailResponses.find(dr => dr.data.id === parseInt(opp.id, 10));
        // The pipeline ensures 'details' is not undefined, but a fallback is good practice
        if (!details) {
            throw new Error(`Details not found for opportunity ID: ${opp.id}`);
        }
        return { ...opp, details };
    });

    try {
        const processedGrants = await processGrantsForStorage(consolidatedGrants);
        await storeGrantsInDatabase(processedGrants);
        console.log('✅ Successfully processed and loaded all grants!');
    } catch (error) {
        console.error('❌ Error processing and loading grants:', error);
        throw error;
    }
}

async function processGrantsForStorage(consolidatedGrants: ConsolidatedGrant[]): Promise<ProcessedGrant[]> {
    const processed: ProcessedGrant[] = [];
    console.log('📝 Converting Grants.gov data to our Grant format...');
    
    for (const grant of consolidatedGrants) {
        try {
            const appGrantFormat = mapGrantsGovToGrant(grant);
            const embeddings = await generateEmbeddings(appGrantFormat);
            
            processed.push({
                grant: appGrantFormat,
                embeddings
            });
            
            console.log(`✓ Processed: ${appGrantFormat.title.substring(0, 50)}...`);
        } catch (error) {
            console.error(`❌ Error processing grant:`, error);
            // The mapGrantsGovToGrant function now handles errors more gracefully, so
            // this catch block might not be triggered for missing data, but it's good to keep.
        }
    }
    return processed;
}

async function generateEmbeddings(grant: Omit<Grant, 'id'>): Promise<Omit<GrantEmbedding, 'id' | 'grant_id'>[]> {
    const embeddings: Omit<GrantEmbedding, 'id' | 'grant_id'>[] = [];
    
    try {
        const fullText = `${grant.title} ${grant.description}`;
        const fullTextEmbedding = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: fullText.substring(0, 8000),
            encoding_format: 'float',
        });
        
        embeddings.push({
            embedding_type: 'full_text',
            embedding: fullTextEmbedding.data[0].embedding,
            model_version: 'text-embedding-3-small',
            created_at: new Date()
        });
        
        const titleEmbedding = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: grant.title,
            encoding_format: 'float',
        });
        
        embeddings.push({
            embedding_type: 'title',
            embedding: titleEmbedding.data[0].embedding,
            model_version: 'text-embedding-3-small',
            created_at: new Date()
        });
        
        await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
        console.error('Error generating embeddings:', error);
        throw error;
    }
    return embeddings;
}


async function storeGrantsInDatabase(processedGrants: ProcessedGrant[]): Promise<void> {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        console.log('💾 Storing grants in database...');
        
        for (const { grant, embeddings } of processedGrants) {
            const existingGrant = await client.query(
                'SELECT id FROM grants WHERE title = $1 AND source = $2',
                [grant.title, grant.source]
            );
            
            let grantId: number;
            
            if (existingGrant.rows.length > 0) {
                grantId = existingGrant.rows[0].id;
                // Updated query to include new fields
                await client.query(`
                    UPDATE grants 
                    SET description = $1, deadline = $2, funding_amount = $3, 
                        source_url = $4, focus_areas = $5, posted_date = $6, 
                        created_at = COALESCE(created_at, $7), 
                        agency = $8, eligibility_description = $9, focus_area_titles = $10 
                    WHERE id = $11
                `, [
                    grant.description,
                    grant.deadline,
                    grant.funding_amount,
                    grant.source_url,
                    grant.focus_areas,
                    grant.posted_date,
                    grant.created_at,
                    grant.agency, // New field
                    grant.eligibility_description, // New field
                    grant.focus_area_titles, // New field
                    grantId
                ]);
                
                console.log(`📝 Updated existing grant: ${grant.title.substring(0, 50)}...`);
            } else {
                // Updated query to include new fields
                const insertResult = await client.query(`
                    INSERT INTO grants (title, description, deadline, funding_amount, source, 
                        source_url, focus_areas, posted_date, created_at,
                        agency, eligibility_description, focus_area_titles)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                    RETURNING id
                `, [
                    grant.title,
                    grant.description,
                    grant.deadline,
                    grant.funding_amount,
                    grant.source,
                    grant.source_url,
                    grant.focus_areas,
                    grant.posted_date,
                    grant.created_at,
                    grant.agency, // New field
                    grant.eligibility_description, // New field
                    grant.focus_area_titles // New field
                ]);
                
                grantId = insertResult.rows[0].id;
                console.log(`✨ Inserted new grant: ${grant.title.substring(0, 50)}...`);
            }
            
            await storeEmbeddings(client, grantId, embeddings);
        }
        
        await client.query('COMMIT');
        console.log(`✅ Successfully stored ${processedGrants.length} grants in database!`);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Database error:', error);
        throw error;
    } finally {
        client.release();
    }
}


async function storeEmbeddings(client: any, grantId: number, embeddings: Omit<GrantEmbedding, 'id' | 'grant_id'>[]): Promise<void> {
    for (const embedding of embeddings) {
        const existingEmbedding = await client.query(
            'SELECT id FROM grant_embeddings WHERE grant_id = $1 AND embedding_type = $2 AND model_version = $3',
            [grantId, embedding.embedding_type, embedding.model_version]
        );
        
        if (existingEmbedding.rows.length > 0) {
            await client.query(`
                UPDATE grant_embeddings 
                SET embedding = $1, created_at = $2
                WHERE grant_id = $3 AND embedding_type = $4 AND model_version = $5
            `, [
                JSON.stringify(embedding.embedding),
                embedding.created_at,
                grantId,
                embedding.embedding_type,
                embedding.model_version
            ]);
        } else {
            await client.query(`
                INSERT INTO grant_embeddings (grant_id, embedding_type, embedding, model_version, created_at)
                VALUES ($1, $2, $3, $4, $5)
            `, [
                grantId,
                embedding.embedding_type,
                JSON.stringify(embedding.embedding),
                embedding.model_version,
                embedding.created_at
            ]);
        }
    }
}


// Utility function to get processing stats
export async function getProcessingStats(): Promise<void> {
    const client = await pool.connect();
    
    try {
        const grantsCount = await client.query('SELECT COUNT(*) FROM grants');
        const embeddingsCount = await client.query('SELECT COUNT(*) FROM grant_embeddings');
        const recentGrants = await client.query(
            'SELECT COUNT(*) FROM grants WHERE created_at >= NOW() - INTERVAL \'24 hours\''
        );
        
        console.log('\n📊 Database Stats:');
        console.log(`   Total grants: ${grantsCount.rows[0].count}`);
        console.log(`   Total embeddings: ${embeddingsCount.rows[0].count}`);
        console.log(`   Grants added in last 24h: ${recentGrants.rows[0].count}`);
    } catch (error) {
        console.error('Error getting stats:', error);
    } finally {
        client.release();
    }
}