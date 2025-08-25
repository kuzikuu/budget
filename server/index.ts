import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createClient } from 'redis';

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

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Set up routes and start server
(async () => {
  try {
    // Connect to Redis first
    await redisClient.connect();
    
    const server = await registerRoutes(app);
    
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      console.error('Error:', err);
    });

    // In production (Render), just serve the API
    if (process.env.NODE_ENV === "production") {
      log('Running in production mode - API only');
    } else {
      // In development, set up Vite dev server
      await setupVite(app, server);
    }

    // Start the server
    const port = parseInt(process.env.PORT || '5000', 10);
    server.listen({
      port,
      host: "0.0.0.0",
    }, () => {
      log(`🚀 Server running on port ${port}`);
      log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      log(`🌐 API available at: http://localhost:${port}/api`);
      log(`🔴 Redis connected: ${redisClient.isReady ? 'Yes' : 'No'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
