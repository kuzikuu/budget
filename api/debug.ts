import { createClient } from 'redis';

// Simple Redis client
let redisClient: any = null;

async function getRedisClient() {
  if (redisClient && redisClient.isReady) {
    return redisClient;
  }

  try {
    console.log('🔌 Creating Redis connection for debug...');
    
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
    console.log('✅ Redis connected for debug');
    return redisClient;
    
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    redisClient = null;
    return null;
  }
}

export async function GET() {
  try {
    console.log('🔍 Debug endpoint - checking Redis...');
    
    const client = await getRedisClient();
    if (!client) {
      return Response.json({ 
        error: 'Redis not connected',
        message: 'Failed to connect to Redis'
      }, { status: 500 });
    }
    
    // Check if the expenses key exists
    const exists = await client.exists('budgetbuddy:expenses');
    console.log(`🔍 Key 'budgetbuddy:expenses' exists: ${exists}`);
    
    if (exists) {
      // Get the raw data
      const rawData = await client.get('budgetbuddy:expenses');
      console.log(`🔍 Raw data from Redis: ${rawData}`);
      
      if (rawData) {
        try {
          const parsed = JSON.parse(rawData);
          console.log(`🔍 Parsed data: ${parsed.length} expenses`);
          return Response.json({
            message: 'Redis debug info',
            keyExists: true,
            rawData: rawData.substring(0, 200) + '...',
            parsedLength: parsed.length,
            parsedData: parsed
          });
        } catch (parseError) {
          console.error('❌ Failed to parse Redis data:', parseError);
          return Response.json({
            message: 'Redis debug info',
            keyExists: true,
            rawData: rawData.substring(0, 200) + '...',
            parseError: parseError.message
          });
        }
      } else {
        return Response.json({
          message: 'Redis debug info',
          keyExists: true,
          rawData: null,
          error: 'Key exists but data is null'
        });
      }
    } else {
      return Response.json({
        message: 'Redis debug info',
        keyExists: false,
        rawData: null,
        error: 'Key does not exist in Redis'
      });
    }
    
  } catch (error) {
    console.error('💥 Debug endpoint error:', error.message);
    return Response.json({ 
      error: 'Debug endpoint failed',
      message: error.message
    }, { status: 500 });
  }
}
