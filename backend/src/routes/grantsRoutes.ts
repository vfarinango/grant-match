import express, { Request, Response } from 'express';
const router = express.Router(); // Create a new router instance

// Import database connection pool
import pool from '../db/connection'; 

// Define an interface for the Grant data (for backend validation later)
interface Grant {
  id: number;
  title: string;
  description: string;
  deadline?: Date; 
  funding_amount?: number;  
  source?: string;
  source_url?: string;
  focus_areas?: string[]; 
  posted_date?: Date; 
  embedding?: number[]; 
  created_at?: Date;
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

  // --- Placeholder for AI search logic ---
  // Steps for future implementation:
  // 1. Generate embedding for userQuery using OpenAI API
  // 2. Query DB using pgvector's cosine similarity operator
  // 3. Return ranked results

  // For now, returning a placeholder 
  res.json({ message: `Search received for: "${userQuery}". AI logic not yet implemented.`, results: [] });
  // --- End Placeholder ---

});

export default router; 