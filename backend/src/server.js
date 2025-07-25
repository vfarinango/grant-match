require('dotenv').config(); // Load environment variables

const express = require('express'); // Importing express module

const pool = require('./db/connection') // Path to my connection.js file

const cors = require('cors'); // For frontend connection

const app = express(); // Creating express object

const PORT = process.env.PORT; // Setting a port for this app

// Middleware to handle JSON requests
app.use(express.json());

// Allow frontend to connect
app.use(cors());



// Basic testing route
app.get('/', (req, res) => {
  res.json({ 
    message: 'GrantMatch API is running!',
    timestamp: new Date().toISOString()
  });
});

// Test Health check route
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: result.rows[0].now 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

// New route to fetch grants data
app.get('/api/grants', async (req, res) => {
  try {
    // Query the 'grants' table
    const result = await db.query('SELECT id, title, description, deadline, funding_amount, source, source_url, focus_areas, posted_date FROM grants');

    // Send the rows as a JSON response
    res.json(result.rows);

  } catch (err) {
    console.error('Error fetching grants:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});


// Start server using listen function
app.listen(PORT, function (err) {
    if(err){
        console.log('Error while starting server.');
    } 
    else{
        console.log(`Server running on port ${PORT}`);
    }
})

