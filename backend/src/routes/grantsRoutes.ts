import express, { Request, Response } from 'express';
const router = express.Router(); // Create a new router instance

// Import database connection pool
import pool from '../db/connection'; 

// Import OpenAI
import OpenAI from 'openai';
const openai = new OpenAI();



// Define an interface for the Grant data (for backend validation later)
export interface Grant {
  id: number;
  title: string;
  description: string;
  deadline?: Date; 
  funding_amount?: number;  
  source?: string;
  source_url?: string;
  focus_areas?: string[]; 
  posted_date?: Date; 
  created_at?: Date;
}

// embeddings interface
export interface GrantEmbedding {
  id: number;
  grant_id: number;
  embedding_type: 'full_text' | 'title' | 'description';
  embedding: number[];
  model_version: string;
  created_at: Date;
}


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
    const result = await pool.query<Grant>('SELECT id, title, description, deadline, funding_amount, source, source_url, focus_areas, posted_date FROM grants');
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching grants:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});


// GET grants by search (where AI search logic will go)
router.get('/search', async (req: Request, res: Response) => {
  const userQuery: string | undefined = req.query.query as string | undefined;
  if (!userQuery) {
    return res.status(400).json({ error: "Search query is required." });
  }

  // --- Placeholder for AI search logic. Steps: ---
  try {
    // 1. Generate embedding for userQuery using OpenAI API
    const queryEmbeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: userQuery,
      encoding_format: "float",
    });

    const userQueryEmbedding = queryEmbeddingResponse.data[0].embedding;

    console.log("User query embedding generated successfully.")

    const vectorString = `[${userQueryEmbedding.join(',')}]`; // Outgoing convert: embedding JS array to proper vector format string

    // Debug: Check what's in your database first
    const debugCount = await pool.query(`
      SELECT 
        COUNT(*) as total_grants,
        COUNT(ge.id) as grants_with_embeddings
      FROM grants g
      LEFT JOIN grant_embeddings ge ON g.id = ge.grant_id AND ge.embedding_type = 'full_text'
    `);
    
    console.log("Database debug info:", debugCount.rows[0]);

    // 2. Query DB using pgvector's cosine similarity operator
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
      [vectorString] // Pass the properly formatted vector string     
    );

    console.log("Query executed successfully.");
    console.log("Number of results found:", result.rows.length);

    if (result.rows.length > 0) {
      console.log("Top result similarity score:", result.rows[0].similarity_score);
      console.log("Top result title:", result.rows[0].title);
    }

    // 3. Return ranked results 
    res.json({
      message: `Search received for: "${userQuery}". AI logic implemented.`,
      results: result.rows,
      debug: {
        totalGrants: debugCount.rows[0].total_grants,
        grantsWithEmbeddings: debugCount.rows[0].grants_with_embeddings,
        resultsFound: result.rows.length
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

export default router; 

// Summarize grant feature backend: 
// Update the grants model to include an optional summary.
// Write a function that takes in a grant, sends a request to openAI and generates a summary. 
// Write a patch request that runs that function and adds the summary to the grant.
// https://github.com/Ada-C23/NPC-Generator/blob/solution-with-gemini/app/routes/character_routes.py
// https://github.com/Ada-C23/pet_name_generator/blob/solution/app/routes/pet_routes.py
// Validate helper functions (validate specific grant, make it a dict, use that dict to update the existing model)



