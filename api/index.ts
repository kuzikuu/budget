import { createClient } from 'redis';
import { storage } from '../../server/storage';

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

// Initialize Redis connection
let isRedisConnected = false;

async function ensureRedisConnection() {
  if (!isRedisConnected) {
    try {
      await redisClient.connect();
      isRedisConnected = true;
      console.log('✅ Redis connected successfully');
    } catch (error) {
      console.error('❌ Failed to connect to Redis:', error);
    }
  }
}

// Export the handler for Vercel
export default async function handler(req: any, res: any) {
  try {
    // Ensure Redis connection
    await ensureRedisConnection();
    
    // Handle different HTTP methods and routes
    const { method, url } = req;
    const path = url.replace('/api', '');
    
    console.log(`${method} ${path}`);
    
    // Route handling based on path and method
    if (path.startsWith('/expenses')) {
      if (method === 'GET') {
        const householdId = req.query.householdId || 'default-household';
        const expenses = await storage.getExpenses(householdId);
        return res.status(200).json(expenses);
      } else if (method === 'POST') {
        const expense = await storage.createExpense(req.body);
        return res.status(201).json(expense);
      }
    }
    
    if (path.startsWith('/categories')) {
      if (method === 'GET') {
        const householdId = req.query.householdId || 'default-household';
        const categories = await storage.getCategories(householdId);
        return res.status(200).json(categories);
      } else if (method === 'POST') {
        const category = await storage.createCategory(req.body);
        return res.status(201).json(category);
      }
    }
    
    if (path.startsWith('/budgets')) {
      if (method === 'GET') {
        const householdId = req.query.householdId || 'default-household';
        const budgets = await storage.getBudgets(householdId);
        return res.status(200).json(budgets);
      } else if (method === 'POST') {
        const budget = await storage.createBudget(req.body);
        return res.status(201).json(budget);
      }
    }
    
    if (path.startsWith('/dashboard')) {
      if (method === 'GET') {
        const householdId = req.query.householdId || 'default-household';
        const [expenses, categories, budgets] = await Promise.all([
          storage.getExpenses(householdId),
          storage.getCategories(householdId),
          storage.getBudgets(householdId)
        ]);
        
        return res.status(200).json({
          expenses,
          categories,
          budgets
        });
      }
    }
    
    // Default response for unknown routes
    return res.status(404).json({ message: 'Route not found' });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
