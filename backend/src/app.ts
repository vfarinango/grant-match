import express from 'express';
import cors from 'cors';
import grantsRoutes from './routes/grantsRoutes';
//import { Request, Response } from 'express'; 

const app = express();

// Middleware to handle JSON requests
app.use(express.json());

// Allow frontend to connect
app.use(cors());

// Use grants routes. All routes in grantsRoutes will be prefixed with /api/grants
app.use('/api/grants', grantsRoutes);

// Test root route
app.get('/', (req, res) => { // (req: Request, res: Response)
  res.send('we are at the root route of our server');
});

export default app; 