import app from './app.js';
import { connectDB } from './config/database.js';
import './models/index.js'; // Ensure models are loaded and associations defined

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to database
  await connectDB();

  // Start Express server
  app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
};

startServer();
// Trigger nodemon restart 
