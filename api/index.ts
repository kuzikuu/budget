import express from 'express';
import { createClient } from 'redis';
import { registerRoutes } from '../../server/routes';

// Create Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Redis configuration
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://default:AeZMAAIncDE1MDk2ZGZjZDE3MGU0ZTc3YjExNmRhMzM3NjcyMDIyMXAxNTg5NTY@big-firefly-58956.upstash.io:6379',
  socket: {
    tls: true,
    rejectUnauthorized: false
  }
});

// Connect to Redis
redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Connected to Redis');
});

// Make Redis client available globally
(global as any).redisClient = redisClient;

// Set up routes
(async () => {
  try {
    await redisClient.connect();
    await registerRoutes(app);
  } catch (error) {
    console.error('Failed to set up routes:', error);
  }
})();

// Export for Vercel
export default app;
