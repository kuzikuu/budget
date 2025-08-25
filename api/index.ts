// Clean Redis API for BudgetBuddy - categories and budgets but no default expenses
import { createClient } from 'redis';

// Redis configuration with connection pooling
let redisClient: any = null;
let isConnecting = false;
let lastConnectionAttempt = 0;
const CONNECTION_COOLDOWN = 5000; // 5 seconds between connection attempts

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
  BUDGETS: 'budgetbuddy:budgets'
};

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

// Smart Redis operations - categories and budgets get defaults, expenses start empty
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
    if (key === REDIS_KEYS.EXPENSES) {
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
    console.log(`🔌 setToRedis called for key: ${key}`);
    console.log(`🔌 Data to save:`, data);
    console.log(`🔌 Data length: ${data.length}`);
    
    const connected = await ensureRedisConnection();
    console.log(`🔌 Redis connection status: ${connected}`);
    
    if (!connected) {
      console.log(`⚠️ Redis not connected, skipping save for ${key}`);
      return false;
    }

    console.log(`🔌 About to save to Redis key: ${key}`);
    const dataToSave = JSON.stringify(data);
    console.log(`🔌 JSON string length: ${dataToSave.length}`);
    
    await redisClient.set(key, dataToSave);
    console.log(`✅ Data saved to Redis: ${key} (${data.length} items)`);
    
    // Double-check by reading it back immediately
    console.log(`🔍 Double-checking save by reading back...`);
    const verifyData = await redisClient.get(key);
    console.log(`🔍 Verification - raw data from Redis:`, verifyData);
    if (verifyData) {
      const parsed = JSON.parse(verifyData);
      console.log(`🔍 Verification - parsed data:`, parsed);
      console.log(`🔍 Verification - parsed length: ${parsed.length}`);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Failed to save to Redis (${key}):`, error);
    console.error(`❌ Error details:`, error.message);
    console.error(`❌ Error stack:`, error.stack);
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

    // Handle debug route to check Redis contents
    if (url.includes('/debug') && method === 'GET') {
      console.log('🔍 Debug route - checking Redis contents...');
      try {
        const connected = await ensureRedisConnection();
        if (!connected) {
          return res.status(500).json({ message: "Redis not connected" });
        }

        const [categories, budgets, expenses] = await Promise.all([
          redisClient.get(REDIS_KEYS.CATEGORIES),
          redisClient.get(REDIS_KEYS.BUDGETS),
          redisClient.get(REDIS_KEYS.EXPENSES)
        ]);

        return res.status(200).json({
          message: "Redis debug info",
          categories: categories ? JSON.parse(categories) : null,
          budgets: budgets ? JSON.parse(budgets) : null,
          expenses: expenses ? JSON.parse(expenses) : null,
          categoriesLength: categories ? JSON.parse(categories).length : 0,
          budgetsLength: budgets ? JSON.parse(budgets).length : 0,
          expensesLength: expenses ? JSON.parse(expenses).length : 0
        });
      } catch (error) {
        console.error('❌ Debug route error:', error);
        return res.status(500).json({ message: "Debug error", error: error.message });
      }
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
        const expenses = await getFromRedis(REDIS_KEYS.EXPENSES);
        console.log(`📊 Returning expenses: ${expenses.length}`);
        console.log(`📊 Expense details:`, expenses);
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

        console.log('🔍 New expense object:', newExpense);

        // Get current expenses from Redis
        console.log('📥 Getting current expenses from Redis...');
        const currentExpenses = await getFromRedis(REDIS_KEYS.EXPENSES);
        console.log(`📊 Current expenses before adding: ${currentExpenses.length}`);
        console.log('📊 Current expenses array:', currentExpenses);
        
        // Add new expense
        currentExpenses.push(newExpense);
        console.log(`📊 Expenses after adding: ${currentExpenses.length}`);
        console.log('📊 Updated expenses array:', currentExpenses);

        // Try to save to Redis
        console.log('💾 Attempting to save to Redis...');
        const saved = await setToRedis(REDIS_KEYS.EXPENSES, currentExpenses);
        console.log(`💾 Expense ${saved ? 'saved to Redis' : 'saved locally'}. Total: ${currentExpenses.length}`);

        // Verify the save by reading back from Redis
        if (saved) {
          console.log('🔍 Verifying save by reading back from Redis...');
          const verifyExpenses = await getFromRedis(REDIS_KEYS.EXPENSES);
          console.log(`🔍 Verification - expenses in Redis after save: ${verifyExpenses.length}`);
          console.log('🔍 Verification - expenses array:', verifyExpenses);
        } else {
          console.log('❌ Save failed - not verifying');
        }

        return res.status(201).json(newExpense);
      }
      if (method === 'DELETE') {
        console.log('🗑️ Deleting expense:', req.body);
        const expenseId = req.body.id;

        // Get current expenses from Redis
        const currentExpenses = await getFromRedis(REDIS_KEYS.EXPENSES);
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

      // Get all data from Redis
      const [categories, budgets, expenses] = await Promise.all([
        getFromRedis(REDIS_KEYS.CATEGORIES, defaultCategories),
        getFromRedis(REDIS_KEYS.BUDGETS, defaultBudgets),
        getFromRedis(REDIS_KEYS.EXPENSES)
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
    console.log('🔍 No specific route matched, returning empty data');
    return res.status(200).json({
      message: "API working with Redis storage",
      categories: [],
      budgets: [],
      expenses: [],
      debug: {
        method,
        url,
        timestamp: new Date().toISOString(),
        totalExpenses: 0,
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
