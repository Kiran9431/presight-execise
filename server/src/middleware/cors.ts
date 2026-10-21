import cors from 'cors';

const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

export const corsMiddleware = cors({
  origin: CORS_ORIGIN,
  credentials: true
});
