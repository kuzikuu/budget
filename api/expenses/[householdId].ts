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

// Modern Vercel Functions API
export async function GET(request: Request) {
  console.log('📊 GET expenses request');
  
  try {
    const expenses = await getExpenses();
    console.log(`📊 Returning ${expenses.length} expenses`);
    
    return Response.json(expenses);
  } catch (error) {
    console.error('💥 GET Error:', error.message);
    return Response.json({ error: 'Failed to get expenses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  console.log('➕ POST expense request');
  
  try {
    const body = await request.json();
    console.log('➕ Adding expense:', body);
    
    const newExpense = {
      id: `exp${Date.now()}`,
      description: body.description,
      amount: parseFloat(body.amount),
      categoryId: body.categoryId,
      date: body.date
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
      return Response.json(newExpense, { status: 201 });
    } else {
      console.log('❌ Failed to save expense');
      return Response.json({ error: 'Failed to save expense' }, { status: 500 });
    }
  } catch (error) {
    console.error('💥 POST Error:', error.message);
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  console.log('🗑️ DELETE expense request');
  
  try {
    const body = await request.json();
    console.log('🗑️ Deleting expense:', body.id);
    
    const currentExpenses = await getExpenses();
    const updatedExpenses = currentExpenses.filter(exp => exp.id !== body.id);
    
    const saved = await saveExpenses(updatedExpenses);
    
    if (saved) {
      console.log('✅ Expense deleted successfully');
      return Response.json({ message: 'Expense deleted', expenses: updatedExpenses });
    } else {
      console.log('❌ Failed to delete expense');
      return Response.json({ error: 'Failed to delete expense' }, { status: 500 });
    }
  } catch (error) {
    console.error('💥 DELETE Error:', error.message);
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}
