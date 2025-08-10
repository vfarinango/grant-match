import { Grant, GrantEmbedding, SimilarGrant } from '../types/grantMatchTypes';
import express, { Request, Response } from 'express';
const router = express.Router(); // Create a new router instance

// Import database connection pool
import pool from '../db/connection'; 

// Import OpenAI
import OpenAI from 'openai';
const openai = new OpenAI();


// Test "Health" check route
router.get('/health', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: result.rows[0].now 
    });
  } catch (error: unknown) {
    res.status(500).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// GET all grants (basic testing route)
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query<Grant>('SELECT id, title, description, deadline, funding_amount, source, source_url, focus_areas, posted_date, summary FROM grants');
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching grants:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});


// GET grants by search (Regular Search)
router.get('/search', async (req: Request, res: Response) => {
  const userQuery: string | undefined = req.query.query as string | undefined;
  if (!userQuery) {
    return res.status(400).json({ error: "Search query is required." });
  }

  try {
    // 1. Generate embedding for userQuery using OpenAI API
    const queryEmbeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: userQuery,
      encoding_format: "float",
    });

    const userQueryEmbedding = queryEmbeddingResponse.data[0].embedding;
    const vectorString = `[${userQueryEmbedding.join(',')}]`; // Outgoing convert: embedding JS array to proper vector format string
    
    console.log("User query embedding generated successfully.")

    // 2. Query DB using pgvector's cosine similarity operator & relevance threshold
    const RELEVANCE_THRESHOLD = 0.7; 

    const result = await pool.query<{
        id: number;
        title: string;
        description: string;
        deadline: string;
        funding_amount: number;
        source: string;
        source_url: string;
        focus_areas: string[];
        posted_date: string;
        summary: string;
        similarity_score: number;      
    }>(
      `
      SELECT
          g.id, g.title, g.description, g.deadline, g.funding_amount,
          g.source, g.source_url, g.focus_areas, g.posted_date,
          1 - (ge.embedding <=> $1::vector) AS similarity_score
      FROM grants g
      JOIN grant_embeddings ge ON g.id = ge.grant_id
      WHERE ge.embedding_type = 'full_text'
      ORDER BY similarity_score DESC
      LIMIT 10
      `,
      [vectorString] // Pass the formatted vector string
    );

    // 3. Enhanced response with messaging
    let message: string;
    let status: 'excellent' | 'good' | 'fair' | 'no_results';

    if (result.rows.length === 0) {
      message = `No relevant grants found for "${userQuery}". Try broader search terms.`;
      status = 'no_results';
    } else {
      const topScore = result.rows[0].similarity_score;
      if (topScore >= 0.8) {
        message = `Found ${result.rows.length} highly relevant grants for "${userQuery}".`;
        status = 'excellent';
      } else if (topScore >= 0.7) {
        message = `Found ${result.rows.length} relevant grants for "${userQuery}".`;
        status = 'good';
      } else {
        message = `Found ${result.rows.length} potentially relevant grants for "${userQuery}".`;
        status = 'fair';
      }
    }

    res.json({
      message,
      status,
      query: userQuery,
      results: result.rows,
      metadata: {
        totalResults: result.rows.length,
        topSimilarityScore: result.rows.length > 0 ? result.rows[0].similarity_score : null,
        relevanceThreshold: RELEVANCE_THRESHOLD
      }
    });

  } catch (error: any) {
    console.error('Error in search endpoint:', error);
    res.status(500).json({
      error: 'Failed to process search query.',
      details: error.message || 'Unknown error'
    });
  }

});



// Similar Search Feature: GET similar grants of a specific grant id
router.get('/:id/similar', async (req: Request, res: Response) => { 
  try {
    const grantId = parseInt(req.params.id, 10);

    // Input validation for the ID
    if (isNaN(grantId)) {
      return res.status(400).json({ error: "Invalid grant ID format." });
    }

    // Check if grant exists first
    const grantCheck = await pool.query('SELECT id, title FROM grants WHERE id = $1', [grantId]);
    
    if (grantCheck.rows.length === 0) {
      return res.status(404).json({ error: "Grant not found" });
    }

    const baseGrant = grantCheck.rows[0];

    // Define a threshold for similar grants
    const SIMILARITY_THRESHOLD = 0.4; // This is the distance threshold, lower is more similar
    const MAX_SIMILAR_RESULTS = 3; // Limit the number of results for clarity

    // Find similar grants
    const similarQuery = `
      SELECT 
        g.id, g.title, g.description, g.deadline,
        g.funding_amount, g.source, g.source_url, 
        g.focus_areas, g.posted_date,
        1 - (ge1.embedding <=> ge2.embedding) AS similarity_score
      FROM grants g
      JOIN grant_embeddings ge1 ON g.id = ge1.grant_id
      JOIN grant_embeddings ge2 ON ge2.grant_id = $1
      WHERE 
        g.id != $1 
        AND (ge1.embedding <=> ge2.embedding) < ${SIMILARITY_THRESHOLD}
      ORDER BY similarity_score DESC
      LIMIT ${MAX_SIMILAR_RESULTS}
    `;

    const similarResult = await pool.query(similarQuery, [grantId]);

    // Transform results to match SimilarGrant interface
    const similarGrants: SimilarGrant[] = similarResult.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      deadline: row.deadline,
      funding_amount: row.funding_amount,
      source: row.source,
      source_url: row.source_url,
      focus_areas: row.focus_areas,
      posted_date: row.posted_date,
      summary: row.summary,
      similarity_score: row.similarity_score
    }));

    // Enhanced messaging based on results
    let message: string;
    let status: 'excellent' | 'good' | 'fair' | 'no_results';

    if (similarGrants.length === 0) {
      message = `No similar grants found for "${baseGrant.title}".`;
      status = 'no_results';
    } else {
      const topScore = similarGrants[0].similarity_score;
      if (topScore >= 0.8) {
        message = `Found ${similarGrants.length} highly similar grants to "${baseGrant.title}".`;
        status = 'excellent';
      } else if (topScore >= 0.6) {
        message = `Found ${similarGrants.length} similar grants to "${baseGrant.title}".`;
        status = 'good';
      } else {
        message = `Found ${similarGrants.length} potentially similar grants to "${baseGrant.title}".`;
        status = 'fair';
      }
    }

    // Return wrapped response like search endpoint
    res.json({
      message,
      status,
      baseGrant: {
        id: baseGrant.id,
        title: baseGrant.title
      },
      results: similarGrants,
      metadata: {
        totalResults: similarGrants.length,
        basedOnGrantId: grantId,
        topSimilarityScore: similarGrants.length > 0 ? similarGrants[0].similarity_score : null
      }
    });
    
  } catch (error: any) {
    console.error('Error finding similar grants:', error);
    res.status(500).json({
      error: 'Failed to find similar grants',
      details: error.message 
    });
  }
});


// Summarize Feature: PATCH the Grant of a specific id with a summary property
router.patch('/:id/summarize', async (req: Request, res: Response) => {
  // GET grant of a specific grant id
  const grantId = req.params.id;

try {
    // 1. Validate the input ID
    if (isNaN(parseInt(grantId, 10))) {
      return res.status(400).json({ error: "Invalid grant ID format." });
    }

    // 2. Fetch the grant from the database using its ID
    const grantResult = await pool.query('SELECT description FROM grants WHERE id = $1', [grantId]);

    // 3. Handle case where grant is not found
    if (grantResult.rows.length === 0) {
      return res.status(404).json({ error: "Grant not found." });
    }

    const grantDescription = grantResult.rows[0].description;
    
    // 1. Generate the summary using OpenAI's Chat Completions API
    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: "You are a helpful assistant that summarizes grant descriptions concisely and accurately for non-profit organizations. The summary should be no more than three sentences."
            },
            {
                role: "user",
                content: `Please provide a short summary of the following grant description:\n\n"${grantDescription}"`
            }
        ],
        temperature: 0.7,
        max_tokens: 150,
    });

    const generatedSummary = completion.choices[0]?.message?.content?.trim();

    if (!generatedSummary) {
        return res.status(500).json({ error: "Failed to generate a summary." });
    }

    // 2. Update the grant in the database with the new summary
    await pool.query(
        'UPDATE grants SET summary = $1 WHERE id = $2',
        [generatedSummary, grantId]
    );

    // 3. Return a success response with the new summary
    res.status(200).json({
        message: `Summary generated and saved for grant ID: ${grantId}`,
        summary: generatedSummary
    });


  } catch (error: any) {
    console.error('Error generating or saving summary:', error);
    res.status(500).json({
      error: 'Failed to generate summary.',
      details: error.message || 'An unknown error occurred.'
    });
  }
});


export default router; 

