import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from 'redis';

// Redis configuration
let redisClient: any = null;
let isConnecting = false;
let lastConnectionAttempt = 0;
const CONNECTION_COOLDOWN = 5000;

// Initialize Redis client
function createRedisClient() {
  if (redisClient) return redisClient;
  
  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://default:AeZMAAIncDE1MDk2ZGZjZDE3MGU0ZTc3YjExNmRhMzM3NjcyMDIyMXAxNTg5NTY@big-firefly-58956.upstash.io:6379',
    socket: {
      tls: true,
      rejectUnauthorized: false,
      connectTimeout: 10000
    }
  });

  redisClient.on('error', (err: any) => {
    console.error('Redis Client Error:', err);
    redisClient = null;
  });

  redisClient.on('connect', () => {
    console.log('✅ Redis connected successfully');
  });

  redisClient.on('ready', () => {
    console.log('✅ Redis ready for commands');
  });

  redisClient.on('end', () => {
    console.log('❌ Redis connection ended');
    redisClient = null;
  });

  return redisClient;
}

// Smart Redis connection management
async function ensureRedisConnection() {
  const now = Date.now();
  
  if (isConnecting) {
    console.log('⏳ Redis connection already in progress, waiting...');
    return false;
  }
  
  if (now - lastConnectionAttempt < CONNECTION_COOLDOWN) {
    console.log('⏳ Redis connection cooldown, using fallback');
    return false;
  }
  
  if (redisClient && redisClient.isReady) {
    return true;
  }
  
  try {
    isConnecting = true;
    lastConnectionAttempt = now;
    
    console.log('🔌 Attempting Redis connection...');
    const client = createRedisClient();
    await client.connect();
    
    isConnecting = false;
    return true;
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    isConnecting = false;
    redisClient = null;
    return false;
  }
}

// Redis operations
async function getFromRedis(key: string, defaultValue: any[] = []) {
  try {
    const connected = await ensureRedisConnection();
    if (!connected) {
      console.log(`⚠️ Redis not connected, using default data for ${key}`);
      return defaultValue;
    }

    const data = await redisClient.get(key);
    if (data) {
      const parsed = JSON.parse(data);
      console.log(`✅ Retrieved from Redis: ${key} (${parsed.length} items)`);
      return parsed;
    }

    // For categories and budgets, initialize with defaults if not found
    // For expenses, always return empty array
    if (key === 'budgetbuddy:expenses') {
      console.log(`📝 Expenses key not found, returning empty array (no default expenses)`);
      return [];
    } else {
      console.log(`📝 Initializing ${key} with default data`);
      const saved = await setToRedis(key, defaultValue);
      if (saved) {
        console.log(`✅ Default data initialized in Redis for ${key}`);
      } else {
        console.log(`⚠️ Failed to initialize default data in Redis for ${key}`);
      }
      return defaultValue;
    }
  } catch (error) {
    console.error(`❌ Failed to get from Redis (${key}):`, error);
    return defaultValue;
  }
}

async function setToRedis(key: string, data: any) {
  try {
    const connected = await ensureRedisConnection();
    if (!connected) {
      console.log(`⚠️ Redis not connected, skipping save for ${key}`);
      return false;
    }

    await redisClient.set(key, JSON.stringify(data));
    console.log(`✅ Data saved to Redis: ${key} (${data.length} items)`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to save to Redis (${key}):`, error);
    return false;
  }
}

// Default categories and budgets (but NO default expenses)
const defaultCategories = [
  { id: "cat1", name: "Groceries", color: "#2563EB" },
  { id: "cat2", name: "Transportation", color: "#059669" },
  { id: "cat3", name: "Utilities", color: "#DC2626" },
  { id: "cat4", name: "Healthcare", color: "#DB2777" },
  { id: "cat5", name: "Personal", color: "#7C3AED" },
  { id: "cat6", name: "Student Loan", color: "#F59E0B" },
  { id: "cat7", name: "Credit Cards", color: "#EF4444" },
  { id: "cat8", name: "Savings", color: "#10B981" }
];

const defaultBudgets = [
  { id: "budget1", categoryId: "cat1", amount: 800, period: "monthly" },
  { id: "budget2", categoryId: "cat2", amount: 200, period: "monthly" },
  { id: "budget3", categoryId: "cat3", amount: 400, period: "monthly" },
  { id: "budget4", categoryId: "cat4", amount: 300, period: "monthly" },
  { id: "budget5", categoryId: "cat5", amount: 400, period: "monthly" },
  { id: "budget6", categoryId: "cat6", amount: 1100, period: "monthly" },
  { id: "budget7", categoryId: "cat7", amount: 1000, period: "monthly" },
  { id: "budget8", categoryId: "cat8", amount: 1000, period: "monthly" }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;
  const { householdId } = req.query;

  console.log('=== DASHBOARD API CALL ===');
  console.log('Method:', method);
  console.log('Household ID:', householdId);
  console.log('Redis Status:', redisClient ? (redisClient.isReady ? 'Connected' : 'Connecting') : 'Not initialized');
  console.log('==========================');

  if (method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('📊 Handling dashboard request');

    // Get all data from Redis
    const [categories, budgets, expenses] = await Promise.all([
      getFromRedis('budgetbuddy:categories', defaultCategories),
      getFromRedis('budgetbuddy:budgets', defaultBudgets),
      getFromRedis('budgetbuddy:expenses')
    ]);

    const dashboardData = { categories, budgets, expenses };
    console.log(`✅ Dashboard data - Categories: ${categories.length}, Budgets: ${budgets.length}, Expenses: ${expenses.length}`);
    return res.status(200).json(dashboardData);

  } catch (error) {
    console.error('💥 Dashboard API Error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
      stack: error.stack
    });
  }
}
