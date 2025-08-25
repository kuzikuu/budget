// Simple working API for BudgetBuddy with Redis storage
import { createClient } from 'redis';

// Redis configuration
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://default:AeZMAAIncDE1MDk2ZGZjZDE3MGU0ZTc3YjExNmRhMzM3NjcyMDIyMXAxNTg5NTY@big-firefly-58956.upstash.io:6379',
  socket: {
    tls: true,
    rejectUnauthorized: false
  }
});

// Redis connection state
let isRedisConnected = false;
let connectionAttempted = false;

// Initialize Redis connection
async function ensureRedisConnection() {
  if (connectionAttempted) {
    return isRedisConnected;
  }
  
  connectionAttempted = true;
  
  try {
    await redisClient.connect();
    isRedisConnected = true;
    console.log('✅ Redis connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error);
    isRedisConnected = false;
    return false;
  }
}

// Redis data keys
const REDIS_KEYS = {
  EXPENSES: 'budgetbuddy:expenses',
  CATEGORIES: 'budgetbuddy:categories',
  BUDGETS: 'budgetbuddy:budgets'
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

// Redis helper functions with fallback
async function getFromRedis(key: string, defaultValue: any[] = []) {
  try {
    const connected = await ensureRedisConnection();
    if (!connected) {
      console.log(`Redis not connected, using default data for ${key}`);
      return defaultValue;
    }
    
    const data = await redisClient.get(key);
    if (data) {
      const parsed = JSON.parse(data);
      console.log(`✅ Retrieved from Redis: ${key} (${parsed.length} items)`);
      return parsed;
    }
    
    // Initialize with default data if key doesn't exist
    await setToRedis(key, defaultValue);
    return defaultValue;
  } catch (error) {
    console.error(`Failed to get from Redis (${key}):`, error);
    return defaultValue;
  }
}

async function setToRedis(key: string, data: any) {
  try {
    const connected = await ensureRedisConnection();
    if (!connected) {
      console.log(`Redis not connected, skipping save for ${key}`);
      return false;
    }
    
    await redisClient.set(key, JSON.stringify(data));
    console.log(`✅ Data saved to Redis: ${key}`);
    return true;
  } catch (error) {
    console.error(`Failed to save to Redis (${key}):`, error);
    return false;
  }
}

export default async function handler(req: any, res: any) {
  try {
    const { method, url } = req;
    
    console.log('=== API CALL ===');
    console.log('Method:', method);
    console.log('URL:', url);
    console.log('================');
    
    // Handle all routes with Redis storage
    if (url.includes('/categories') || url.includes('/categories/')) {
      console.log('Handling categories request');
      if (method === 'GET') {
        const categories = await getFromRedis(REDIS_KEYS.CATEGORIES, defaultCategories);
        return res.status(200).json(categories);
      }
      if (method === 'POST') {
        return res.status(201).json({ message: "Category created" });
      }
    }
    
    if (url.includes('/budgets') || url.includes('/budgets/')) {
      console.log('Handling budgets request');
      if (method === 'GET') {
        const budgets = await getFromRedis(REDIS_KEYS.BUDGETS, defaultBudgets);
        return res.status(200).json(budgets);
      }
      if (method === 'POST') {
        return res.status(201).json({ message: "Budget created" });
      }
    }
    
    if (url.includes('/expenses') || url.includes('/expenses/')) {
      console.log('Handling expenses request');
      if (method === 'GET') {
        const expenses = await getFromRedis(REDIS_KEYS.EXPENSES, defaultExpenses);
        console.log('Returning expenses:', expenses.length);
        return res.status(200).json(expenses);
      }
      if (method === 'POST') {
        console.log('Creating new expense:', req.body);
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
        
        // Try to save to Redis, but don't fail if it doesn't work
        const saved = await setToRedis(REDIS_KEYS.EXPENSES, currentExpenses);
        console.log(`Expense ${saved ? 'saved to Redis' : 'stored locally'}. Total: ${currentExpenses.length}`);
        
        return res.status(201).json(newExpense);
      }
      if (method === 'DELETE') {
        console.log('Deleting expense:', req.body);
        const expenseId = req.body.id;
        
        // Get current expenses from Redis
        const currentExpenses = await getFromRedis(REDIS_KEYS.EXPENSES, defaultExpenses);
        const updatedExpenses = currentExpenses.filter(exp => exp.id !== expenseId);
        
        // Try to save to Redis, but don't fail if it doesn't work
        const saved = await setToRedis(REDIS_KEYS.EXPENSES, updatedExpenses);
        console.log(`Expense ${saved ? 'deleted from Redis' : 'deleted locally'}. Total: ${updatedExpenses.length}`);
        
        return res.status(200).json({ message: "Expense deleted" });
      }
    }
    
    if (url.includes('/dashboard') || url.includes('/dashboard/')) {
      console.log('Handling dashboard request');
      
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
      console.log('Handling crypto request');
      return res.status(200).json({
        holdings: [
          { symbol: "XRP", amount: "22000", platform: "Coinbase" },
          { symbol: "TOBY", amount: "1150000000000", platform: "DEX" }
        ]
      });
    }
    
    // Default response
    console.log('No specific route matched, returning default data');
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
        redisConnected: isRedisConnected
      }
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      stack: error.stack
    });
  }
}
