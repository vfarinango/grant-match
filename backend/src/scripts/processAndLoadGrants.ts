import pool from '../db/connection';
import { Grant, GrantEmbedding } from '../types/grantMatchTypes';
import { GrantsGovDetailsResponse } from '../types/grantsGovApiTypes';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface ProcessedGrant {
    grant: Omit<Grant, 'id'>;
    embeddings: Omit<GrantEmbedding, 'id' | 'grant_id'>[];
}

export async function processAndLoadGrants(grantsGovData: GrantsGovDetailsResponse[], opportunityData: any[]): Promise<void> {
    console.log(`🔄 Processing ${grantsGovData.length} grants from Grants.gov...`);
    
    if (grantsGovData.length !== opportunityData.length) {
        throw new Error('Mismatch between grants detail data and opportunity data arrays');
    }
    
    try {
        // Process grants and generate embeddings
        const processedGrants = await processGrantsForStorage(grantsGovData, opportunityData);
        
        // Store in database
        await storeGrantsInDatabase(processedGrants);
        
        console.log('✅ Successfully processed and loaded all grants!');
    } catch (error) {
        console.error('❌ Error processing and loading grants:', error);
        throw error;
    }
}

async function processGrantsForStorage(grantsGovData: GrantsGovDetailsResponse[], opportunityData: any[]): Promise<ProcessedGrant[]> {
    const processed: ProcessedGrant[] = [];
    
    console.log('📝 Converting Grants.gov data to our Grant format...');
    
    for (let i = 0; i < grantsGovData.length; i++) {
        try {
            const grantData = grantsGovData[i];
            const oppData = opportunityData[i];
            
            const grant = mapGrantsGovToGrant(grantData, oppData);
            const embeddings = await generateEmbeddings(grant);
            
            processed.push({
                grant,
                embeddings
            });
            
            console.log(`✓ Processed: ${grant.title.substring(0, 50)}...`);
        } catch (error) {
            console.error(`❌ Error processing grant at index ${i}:`, error);
            // Continue processing other grants
        }
    }
    
    return processed;
}

function mapGrantsGovToGrant(grantsGovData: GrantsGovDetailsResponse, opportunityData: any): Omit<Grant, 'id'> {
    const { data } = grantsGovData;
    const synopsis = data.synopsis;
    
    // Parse deadline from opportunity data
    let deadline: Date | undefined;
    if (opportunityData.closeDate) {
        deadline = new Date(opportunityData.closeDate);
    }
    
    // Parse posted date from opportunity data
    let postedDate: Date | undefined;
    if (opportunityData.openDate) {
        postedDate = new Date(opportunityData.openDate);
    }
    
    // Format funding amount
    let fundingAmount: string | undefined;
    if (synopsis?.awardCeiling && synopsis.awardCeiling !== 'none') {
        if (synopsis.awardFloor && synopsis.awardFloor !== 'none') {
            fundingAmount = `${synopsis.awardFloor} - ${synopsis.awardCeiling}`;
        } else {
            fundingAmount = `Up to ${synopsis.awardCeiling}`;
        }
    }
    
    // Use CFDA list for focus areas (official government classifications)
    let focusAreas: string[] = [];
    if (opportunityData.cfdaList && opportunityData.cfdaList.length > 0) {
        focusAreas = opportunityData.cfdaList.slice(0, 5); // Limit to 5
    }
    // No fallback keyword extraction - let semantic search handle discovery
    
    return {
        title: opportunityData.title,
        description: synopsis?.synopsisDesc || '',
        deadline,
        funding_amount: fundingAmount,
        source: opportunityData.agency || 'Unavailable ☹️',
        source_url: synopsis?.fundingDescLinkUrl,
        focus_areas: focusAreas,
        posted_date: postedDate,
        created_at: new Date()
    };
}

// Note: We rely on semantic embeddings for content discovery rather than keyword matching
// This allows users to find relevant grants through natural language queries

async function generateEmbeddings(grant: Omit<Grant, 'id'>): Promise<Omit<GrantEmbedding, 'id' | 'grant_id'>[]> {
    const embeddings: Omit<GrantEmbedding, 'id' | 'grant_id'>[] = [];
    
    try {
        // Generate embedding for full text (title + description)
        const fullText = `${grant.title} ${grant.description}`;
        const fullTextEmbedding = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: fullText.substring(0, 8000), // Limit to prevent token limit issues
            encoding_format: 'float',
        });
        
        embeddings.push({
            embedding_type: 'full_text',
            embedding: fullTextEmbedding.data[0].embedding,
            model_version: 'text-embedding-3-small',
            created_at: new Date()
        });
        
        // Generate embedding for title only
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
        
        // Add small delay to respect rate limits
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
            // Check if grant already exists (by title and source to avoid duplicates)
            const existingGrant = await client.query(
                'SELECT id FROM grants WHERE title = $1 AND source = $2',
                [grant.title, grant.source]
            );
            
            let grantId: number;
            
            if (existingGrant.rows.length > 0) {
                // Update existing grant
                grantId = existingGrant.rows[0].id;
                await client.query(`
                    UPDATE grants 
                    SET description = $1, deadline = $2, funding_amount = $3, 
                        source_url = $4, focus_areas = $5, posted_date = $6, 
                        created_at = COALESCE(created_at, $7)
                    WHERE id = $8
                `, [
                    grant.description,
                    grant.deadline,
                    grant.funding_amount,
                    grant.source_url,
                    grant.focus_areas,
                    grant.posted_date,
                    grant.created_at,
                    grantId
                ]);
                
                console.log(`📝 Updated existing grant: ${grant.title.substring(0, 50)}...`);
            } else {
                // Insert new grant
                const insertResult = await client.query(`
                    INSERT INTO grants (title, description, deadline, funding_amount, source, 
                                      source_url, focus_areas, posted_date, created_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
                    grant.created_at
                ]);
                
                grantId = insertResult.rows[0].id;
                console.log(`✨ Inserted new grant: ${grant.title.substring(0, 50)}...`);
            }
            
            // Handle embeddings
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
        // Check if embedding already exists
        const existingEmbedding = await client.query(
            'SELECT id FROM grant_embeddings WHERE grant_id = $1 AND embedding_type = $2 AND model_version = $3',
            [grantId, embedding.embedding_type, embedding.model_version]
        );
        
        if (existingEmbedding.rows.length > 0) {
            // Update existing embedding
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
            // Insert new embedding
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