import express from 'express';
import path from 'path';
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/errorHandler';
import usersRouter from './routes/users';
import { initializeSchema } from './database/schema';

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize database schema
initializeSchema();

const app = express();

// Middleware
app.use(corsMiddleware);
app.use(express.json());

// API Routes
app.use('/api/users', usersRouter);

// Serve static files from client build in production
if (NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientBuildPath));

  // Serve index.html for all non-API routes (SPA support)
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${NODE_ENV} mode`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
