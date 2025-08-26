import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from 'redis';

// Simple Redis client - one per function instance
let redisClient: any = null;

async function getRedisClient() {
  if (redisClient && redisClient.isReady) {
    return redisClient;
  }

  try {
    console.log('🔌 Creating new Redis connection...');
    
    // Use environment variable or fallback
    const redisUrl = process.env.REDIS_URL || 'redis://default:AeZMAAIncDE1MDk2ZGZjZDE3MGU0ZTc3YjExNmRhMzM3NjcyMDIyMXAxNTg5NTY@big-firefly-58956.upstash.io:6379';
    
    redisClient = createClient({
      url: redisUrl,
      socket: {
        tls: true,
        rejectUnauthorized: false,
        connectTimeout: 5000,
        keepAlive: 5000
      }
    });

    // Simple event handlers
    redisClient.on('error', (err: any) => {
      console.error('❌ Redis error:', err.message);
      redisClient = null;
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected');
    });

    await redisClient.connect();
    console.log('✅ Redis ready');
    return redisClient;
    
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    redisClient = null;
    throw error;
  }
}

// Simple Redis operations
async function getExpenses() {
  try {
    const client = await getRedisClient();
    const data = await client.get('budgetbuddy:expenses');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('❌ Failed to get expenses:', error.message);
    return [];
  }
}

async function saveExpenses(expenses: any[]) {
  try {
    const client = await getRedisClient();
    await client.set('budgetbuddy:expenses', JSON.stringify(expenses));
    console.log(`✅ Saved ${expenses.length} expenses to Redis`);
    return true;
  } catch (error) {
    console.error('❌ Failed to save expenses:', error.message);
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;
  
  console.log(`=== EXPENSES API: ${method} ===`);
  console.log('Body:', req.body);
  console.log('Query:', req.query);

  try {
    if (method === 'GET') {
      console.log('📊 Getting expenses...');
      const expenses = await getExpenses();
      console.log(`📊 Returning ${expenses.length} expenses`);
      return res.status(200).json(expenses);
    }

    if (method === 'POST') {
      console.log('➕ Adding expense:', req.body);
      
      const newExpense = {
        id: `exp${Date.now()}`,
        description: req.body.description,
        amount: parseFloat(req.body.amount),
        categoryId: req.body.categoryId,
        date: req.body.date
      };

      // Get current expenses
      const currentExpenses = await getExpenses();
      console.log(`📊 Current: ${currentExpenses.length}, Adding: 1`);
      
      // Add new expense
      currentExpenses.push(newExpense);
      
      // Save to Redis
      const saved = await saveExpenses(currentExpenses);
      
      if (saved) {
        console.log('✅ Expense saved successfully');
        return res.status(201).json(newExpense);
      } else {
        console.log('❌ Failed to save expense');
        return res.status(500).json({ error: 'Failed to save expense' });
      }
    }

    if (method === 'DELETE') {
      console.log('🗑️ Deleting expense:', req.body.id);
      
      const currentExpenses = await getExpenses();
      const updatedExpenses = currentExpenses.filter(exp => exp.id !== req.body.id);
      
      const saved = await saveExpenses(updatedExpenses);
      
      if (saved) {
        console.log('✅ Expense deleted successfully');
        return res.status(200).json({ message: 'Expense deleted', expenses: updatedExpenses });
      } else {
        console.log('❌ Failed to delete expense');
        return res.status(500).json({ error: 'Failed to delete expense' });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('💥 API Error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
