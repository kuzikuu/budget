import { createClient } from 'redis';

// Static categories and budgets (no database needed)
const categories = [
  { id: "cat1", name: "Groceries", color: "#2563EB" },
  { id: "cat2", name: "Transportation", color: "#059669" },
  { id: "cat3", name: "Utilities", color: "#DC2626" },
  { id: "cat4", name: "Healthcare", color: "#DB2777" },
  { id: "cat5", name: "Personal", color: "#7C3AED" },
  { id: "cat6", name: "Student Loan", color: "#F59E0B" },
  { id: "cat7", name: "Credit Cards", color: "#EF4444" },
  { id: "cat8", name: "Savings", color: "#10B981" }
];

const budgets = [
  { id: "budget1", categoryId: "cat1", amount: 800, period: "monthly" },
  { id: "budget2", categoryId: "cat2", amount: 200, period: "monthly" },
  { id: "budget3", categoryId: "cat3", amount: 400, period: "monthly" },
  { id: "budget4", categoryId: "cat4", amount: 300, period: "monthly" },
  { id: "budget5", categoryId: "cat5", amount: 400, period: "monthly" },
  { id: "budget6", categoryId: "cat6", amount: 1100, period: "monthly" },
  { id: "budget7", categoryId: "cat7", amount: 1000, period: "monthly" },
  { id: "budget8", categoryId: "cat8", amount: 1000, period: "monthly" }
];

// Simple Redis client for expenses only
let redisClient: any = null;

async function getRedisClient() {
  if (redisClient && redisClient.isReady) {
    return redisClient;
  }

  try {
    console.log('🔌 Creating Redis connection for dashboard...');
    
    const redisUrl = process.env.REDIS_URL || 'redis://default:AeZMAAIncDE1MDk2ZGZjZDE3MGU0ZTc3YjExNmRhMzM3NjcyMDIyMXAxNTg5NTY@big-firefly-58956.upstash.io:6379';
    
    redisClient = createClient({
      url: redisUrl,
      socket: {
        tls: true,
        rejectUnauthorized: false,
        connectTimeout: 5000
      }
    });

    redisClient.on('error', (err: any) => {
      console.error('❌ Redis error:', err.message);
      redisClient = null;
    });

    await redisClient.connect();
    console.log('✅ Redis connected for dashboard');
    return redisClient;
    
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    redisClient = null;
    return null;
  }
}

async function getExpenses() {
  try {
    const client = await getRedisClient();
    if (!client) return [];
    
    const data = await client.get('budgetbuddy:expenses');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('❌ Failed to get expenses:', error.message);
    return [];
  }
}

// Modern Vercel Functions API
export async function GET(request: Request) {
  try {
    console.log('📊 Dashboard request - getting expenses from Redis...');
    
    const expenses = await getExpenses();
    console.log(`📊 Found ${expenses.length} expenses in Redis`);
    
    const dashboardData = { 
      categories, 
      budgets, 
      expenses 
    };
    
    return Response.json(dashboardData);

  } catch (error) {
    console.error('💥 Dashboard API Error:', error.message);
    // Return static data even if Redis fails
    return Response.json({ 
      categories, 
      budgets, 
      expenses: [] 
    });
  }
}
