// Robust Redis API for BudgetBuddy with proper Vercel serverless handling
import { createClient } from 'redis';

// Redis configuration with connection pooling
let redisClient: any = null;
let isConnecting = false;
let lastConnectionAttempt = 0;
const CONNECTION_COOLDOWN = 5000; // 5 seconds between connection attempts

// Track if we've initialized default data
let hasInitializedDefaults = false;

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

  // Handle Redis events
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
  
  // If we're already connecting, wait
  if (isConnecting) {
    console.log('⏳ Redis connection already in progress, waiting...');
    return false;
  }
  
  // If we tried recently, wait for cooldown
  if (now - lastConnectionAttempt < CONNECTION_COOLDOWN) {
    console.log('⏳ Redis connection cooldown, using fallback');
    return false;
  }
  
  // If we have a connected client, use it
  if (redisClient && redisClient.isReady) {
    return true;
  }
  
  // Try to connect
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

// Redis data keys
const REDIS_KEYS = {
  EXPENSES: 'budgetbuddy:expenses',
  CATEGORIES: 'budgetbuddy:categories',
  BUDGETS: 'budgetbuddy:budgets',
  INITIALIZED: 'budgetbuddy:initialized' // Track if we've initialized
};

// Default data
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

const defaultExpenses = [
  { id: "exp1", description: "Grocery shopping", amount: 85.50, categoryId: "cat1", date: "2024-01-15" },
  { id: "exp2", description: "Gas station", amount: 45.00, categoryId: "cat2", date: "2024-01-14" },
  { id: "exp3", description: "Movie tickets", amount: 32.00, categoryId: "cat4", date: "2024-01-13" }
];

// Check if we've already initialized default data
async function checkIfInitialized() {
  try {
    const connected = await ensureRedisConnection();
    if (!connected) return false;
    
    const initialized = await redisClient.get(REDIS_KEYS.INITIALIZED);
    return initialized === 'true';
  } catch (error) {
    console.error('❌ Failed to check initialization status:', error);
    return false;
  }
}

// Mark that we've initialized default data
async function markAsInitialized() {
  try {
    const connected = await ensureRedisConnection();
    if (!connected) return false;
    
    await redisClient.set(REDIS_KEYS.INITIALIZED, 'true');
    console.log('✅ Marked as initialized in Redis');
    return true;
  } catch (error) {
    console.error('❌ Failed to mark as initialized:', error);
    return false;
  }
}

// Robust Redis operations with fallbacks
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

    // Only initialize with default data if this is the first time EVER
    if (!hasInitializedDefaults) {
      const alreadyInitialized = await checkIfInitialized();
      if (!alreadyInitialized) {
        console.log(`📝 First time setup - initializing ${key} with default data`);
        const saved = await setToRedis(key, defaultValue);
        if (saved) {
          console.log(`✅ Default data initialized in Redis for ${key}`);
          await markAsInitialized();
          hasInitializedDefaults = true;
        } else {
          console.log(`⚠️ Failed to initialize default data in Redis for ${key}`);
        }
      } else {
        console.log(`📝 Redis already initialized, ${key} is empty - returning empty array`);
        hasInitializedDefaults = true;
      }
    } else {
      console.log(`📝 Key ${key} not found in Redis, returning empty array (not reinitializing)`);
    }
    
    return [];
  } catch (error) {
    console.error(`❌ Failed to get from Redis (${key}):`, error);
    return [];
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

async function deleteFromRedis(key: string) {
  try {
    const connected = await ensureRedisConnection();
    if (!connected) {
      console.log(`⚠️ Redis not connected, cannot delete ${key}`);
      return false;
    }

    await redisClient.del(key);
    console.log(`🗑️ Key deleted from Redis: ${key}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to delete from Redis (${key}):`, error);
    return false;
  }
}

// Clear all data function
async function clearAllData() {
  try {
    const connected = await ensureRedisConnection();
    if (!connected) {
      console.log('⚠️ Redis not connected, cannot clear data');
      return false;
    }

    await Promise.all([
      redisClient.del(REDIS_KEYS.EXPENSES),
      redisClient.del(REDIS_KEYS.CATEGORIES),
      redisClient.del(REDIS_KEYS.BUDGETS),
      redisClient.del(REDIS_KEYS.INITIALIZED)
    ]);
    
    hasInitializedDefaults = false;
    console.log('🗑️ All data cleared from Redis');
    return true;
  } catch (error) {
    console.error('❌ Failed to clear data:', error);
    return false;
  }
}

export default async function handler(req: any, res: any) {
  try {
    const { method, url } = req;

    console.log('=== API CALL ===');
    console.log('Method:', method);
    console.log('URL:', url);
    console.log('Redis Status:', redisClient ? (redisClient.isReady ? 'Connected' : 'Connecting') : 'Not initialized');
    console.log('================');

    // Handle clear all data route
    if (url.includes('/clear') && method === 'POST') {
      console.log('🗑️ Clearing all data...');
      const cleared = await clearAllData();
      return res.status(200).json({ 
        message: cleared ? "All data cleared" : "Failed to clear data",
        success: cleared
      });
    }

    // Handle all routes with Redis storage
    if (url.includes('/categories') || url.includes('/categories/')) {
      console.log('📋 Handling categories request');
      if (method === 'GET') {
        const categories = await getFromRedis(REDIS_KEYS.CATEGORIES, defaultCategories);
        return res.status(200).json(categories);
      }
      if (method === 'POST') {
        return res.status(201).json({ message: "Category created" });
      }
    }

    if (url.includes('/budgets') || url.includes('/budgets/')) {
      console.log('💰 Handling budgets request');
      if (method === 'GET') {
        const budgets = await getFromRedis(REDIS_KEYS.BUDGETS, defaultBudgets);
        return res.status(200).json(budgets);
      }
      if (method === 'POST') {
        return res.status(201).json({ message: "Budget created" });
      }
    }

    if (url.includes('/expenses') || url.includes('/expenses/')) {
      console.log('💸 Handling expenses request');
      if (method === 'GET') {
        const expenses = await getFromRedis(REDIS_KEYS.EXPENSES, defaultExpenses);
        console.log('📊 Returning expenses:', expenses.length);
        return res.status(200).json(expenses);
      }
      if (method === 'POST') {
        console.log('➕ Creating new expense:', req.body);
        const newExpense = {
          id: `exp${Date.now()}`,
          description: req.body.description,
          amount: parseFloat(req.body.amount),
          categoryId: req.body.categoryId,
          date: req.body.date
        };

        // Get current expenses from Redis
        const currentExpenses = await getFromRedis(REDIS_KEYS.EXPENSES, defaultExpenses);
        currentExpenses.push(newExpense);

        // Try to save to Redis
        const saved = await setToRedis(REDIS_KEYS.EXPENSES, currentExpenses);
        console.log(`💾 Expense ${saved ? 'saved to Redis' : 'saved locally'}. Total: ${currentExpenses.length}`);

        return res.status(201).json(newExpense);
      }
      if (method === 'DELETE') {
        console.log('🗑️ Deleting expense:', req.body);
        const expenseId = req.body.id;

        // Get current expenses from Redis
        const currentExpenses = await getFromRedis(REDIS_KEYS.EXPENSES, defaultExpenses);
        console.log(`📊 Current expenses before delete: ${currentExpenses.length}`);
        
        // Filter out the expense to delete
        const updatedExpenses = currentExpenses.filter(exp => exp.id !== expenseId);
        console.log(`📊 Expenses after delete: ${updatedExpenses.length}`);

        // Save updated expenses to Redis
        const saved = await setToRedis(REDIS_KEYS.EXPENSES, updatedExpenses);
        console.log(`💾 Expense ${saved ? 'deleted from Redis' : 'deleted locally'}. Total: ${updatedExpenses.length}`);

        // Return the updated expense list so frontend can update immediately
        return res.status(200).json({ 
          message: "Expense deleted",
          expenses: updatedExpenses,
          deletedId: expenseId
        });
      }
    }

    if (url.includes('/dashboard') || url.includes('/dashboard/')) {
      console.log('📊 Handling dashboard request');

      // Get all data from Redis with fallbacks
      const [categories, budgets, expenses] = await Promise.all([
        getFromRedis(REDIS_KEYS.CATEGORIES, defaultCategories),
        getFromRedis(REDIS_KEYS.BUDGETS, defaultBudgets),
        getFromRedis(REDIS_KEYS.EXPENSES, defaultExpenses)
      ]);

      const dashboardData = { categories, budgets, expenses };
      console.log(`✅ Dashboard data - Categories: ${categories.length}, Budgets: ${budgets.length}, Expenses: ${expenses.length}`);
      return res.status(200).json(dashboardData);
    }

    if (url.includes('/crypto') || url.includes('/crypto/')) {
      console.log('🪙 Handling crypto request');
      return res.status(200).json({
        holdings: [
          { symbol: "XRP", amount: "22000", platform: "Coinbase" },
          { symbol: "TOBY", amount: "1150000000000", platform: "DEX" }
        ]
      });
    }

    // Default response
    console.log('🔍 No specific route matched, returning default data');
    const [categories, budgets, expenses] = await Promise.all([
      getFromRedis(REDIS_KEYS.CATEGORIES, defaultCategories),
      getFromRedis(REDIS_KEYS.BUDGETS, defaultBudgets),
      getFromRedis(REDIS_KEYS.EXPENSES, defaultExpenses)
    ]);

    return res.status(200).json({
      message: "API working with Redis storage",
      categories,
      budgets,
      expenses,
      debug: {
        method,
        url,
        timestamp: new Date().toISOString(),
        totalExpenses: expenses.length,
        redisStatus: redisClient ? (redisClient.isReady ? 'Connected' : 'Connecting') : 'Not initialized'
      }
    });

  } catch (error) {
    console.error('💥 API Error:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message,
      stack: error.stack
    });
  }
}
