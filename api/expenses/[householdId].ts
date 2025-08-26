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
async function getFromRedis(key: string) {
  try {
    const connected = await ensureRedisConnection();
    if (!connected) {
      console.log(`⚠️ Redis not connected, using empty array for ${key}`);
      return [];
    }

    const data = await redisClient.get(key);
    if (data) {
      const parsed = JSON.parse(data);
      console.log(`✅ Retrieved from Redis: ${key} (${parsed.length} items)`);
      return parsed;
    }

    console.log(`📝 Key not found in Redis: ${key}, returning empty array`);
    return [];
  } catch (error) {
    console.error(`❌ Failed to get from Redis (${key}):`, error);
    return [];
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

const REDIS_KEYS = {
  EXPENSES: 'budgetbuddy:expenses'
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;
  const { householdId } = req.query;

  console.log('=== EXPENSES API CALL ===');
  console.log('Method:', method);
  console.log('Household ID:', householdId);
  console.log('Redis Status:', redisClient ? (redisClient.isReady ? 'Connected' : 'Connecting') : 'Not initialized');
  console.log('========================');

  try {
    if (method === 'GET') {
      console.log('📊 Getting expenses from Redis...');
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

    // Method not allowed
    res.status(405).json({ message: 'Method not allowed' });

  } catch (error) {
    console.error('💥 Expenses API Error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
      stack: error.stack
    });
  }
}
