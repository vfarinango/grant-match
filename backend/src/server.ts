import dotenv from 'dotenv';
dotenv.config();

import app from './app'; 

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8000;

app.listen(PORT, function (err?: Error) {
    if (err) {
        console.log('Error while starting server.');
    } else {
        console.log(`Server running on port ${PORT}`);
    }
});




