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

// Import routes file
const grantsRoutes = require('./routes/grantsRoutes'); 


// Test "Health" check route
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

// Use grants routes. All routes in grantsRoutes will be prefixed with /api/grants
app.use('/api/grants', grantsRoutes);


// Start server using listen function
app.listen(PORT, function (err) {
    if(err){
        console.log('Error while starting server.');
    } 
    else{
        console.log(`Server running on port ${PORT}`);
    }
})

