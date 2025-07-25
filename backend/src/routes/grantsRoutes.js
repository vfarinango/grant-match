const express = require('express');
const router = express.Router(); // Create a new router instance

// Import database connection pool
const pool = require('../db/connection');


// GET all grants (basic testing route)
// GET all grants
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, title, description, deadline, funding_amount, source, source_url, focus_areas, posted_date FROM grants');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching grants:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});



// // New route to fetch grants data
// router.get('/api/grants', async (req, res) => {
//   try {
//     // Query the 'grants' table
//     const result = await pool.query('SELECT id, title, description, deadline, funding_amount, source, source_url, focus_areas, posted_date FROM grants');

//     // Send the rows as a JSON response
//     res.json(result.rows);

//   } catch (err) {
//     console.error('Error fetching grants:', err);
//     res.status(500).json({ error: 'Internal server error', details: err.message });
//   }
// });

// GET grants by search (this is where your AI search logic will go)
router.get('/search', async (req, res) => {
  const userQuery = req.query.query;
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

module.exports = router;