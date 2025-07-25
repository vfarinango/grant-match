import dotenv from 'dotenv'; // Load environment variables
import express from 'express';  // Importing express module
import { Request, Response } from 'express'; 

// Load environment variables (dotenv is now imported)
dotenv.config();

import pool from './db/connection'; // Path to my connection.js file
import cors from 'cors';  // For frontend connection

// Import routes file (TS)
import grantsRoutes from './routes/grantsRoutes';


const app = express(); // Creating express object
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8000; // Setting a port for this app


app.use(express.json()); // Middleware to handle JSON requests
app.use(cors()); // Allow frontend to connect
app.use('/api/grants', grantsRoutes); // Use grants routes. All routes in grantsRoutes will be prefixed with /api/grants



// Test root route
app.get('/', (req: Request, res: Response) => {
  res.send('we are at the root route of our server');
});

// Start server using listen function
app.listen(PORT, function (err?: Error) {
    if(err){
        console.log('Error while starting server.');
    } 
    else{
        console.log(`Server running on port ${PORT}`);
    }
})




