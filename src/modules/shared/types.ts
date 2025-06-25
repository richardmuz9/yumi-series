// CORS configuration
const isDevelopment = process.env['NODE_ENV'] === 'development';
const allowedOrigins = isDevelopment ? ['http://localhost:8000', 'http://localhost:3000', 'http://localhost:5173'] : (process.env['CORS_ORIGINS']?.split(',') || []);

export const corsOptions = {
  origin: isDevelopment ? true : allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie']
}; 