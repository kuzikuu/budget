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
    
    console.log(`${method} ${url}`);
    
    // Extract the path after /api
    const path = url.replace('/api', '');
    
    // Handle dashboard route
    if (path.startsWith('/dashboard/')) {
      if (method === 'GET') {
        const householdId = path.split('/dashboard/')[1];
        console.log('Dashboard request for household:', householdId);
        
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
    
    // Handle expenses route
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
    
    // Handle categories route
    if (path.startsWith('/categories/')) {
      if (method === 'GET') {
        const householdId = path.split('/categories/')[1];
        console.log('Categories request for household:', householdId);
        const categories = await storage.getCategories(householdId);
        return res.status(200).json(categories);
      } else if (method === 'POST') {
        const category = await storage.createCategory(req.body);
        return res.status(201).json(category);
      }
    }
    
    // Handle budgets route
    if (path.startsWith('/budgets/')) {
      if (method === 'GET') {
        const householdId = path.split('/budgets/')[1];
        console.log('Budgets request for household:', householdId);
        const budgets = await storage.getBudgets(householdId);
        return res.status(200).json(budgets);
      } else if (method === 'POST') {
        const budget = await storage.createBudget(req.body);
        return res.status(201).json(budget);
      }
    }
    
    // Handle crypto route
    if (path.startsWith('/crypto/')) {
      if (method === 'GET') {
        const householdId = path.split('/crypto/')[1];
        console.log('Crypto request for household:', householdId);
        const cryptoHoldings = await storage.getCryptoHoldings(householdId);
        
        // For now, return basic crypto data without price fetching
        const cryptoData = cryptoHoldings.map(holding => ({
          ...holding,
          priceUsd: 0, // Placeholder
          usdValue: 0  // Placeholder
        }));
        
        return res.status(200).json({
          holdings: cryptoData,
          totalUsdValue: 0
        });
      }
    }
    
    // Default response for unknown routes
    console.log('Route not found:', path);
    return res.status(404).json({ message: 'Route not found', path });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
