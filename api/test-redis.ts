import { createClient } from 'redis';

export async function GET() {
  try {
    // Test 1: Check if REDIS_URL exists
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      return Response.json({
        error: 'REDIS_URL not set',
        message: 'Please set REDIS_URL in Vercel environment variables'
      }, { status: 500 });
    }

    // Test 2: Try to create Redis client
    let client;
    try {
      console.log('🔌 Testing Redis client creation...');
      client = createClient({
        url: redisUrl,
        socket: {
          tls: true,
          rejectUnauthorized: false,
          connectTimeout: 10000
        }
      });
      console.log('✅ Redis client created successfully');
    } catch (error) {
      return Response.json({
        error: 'Failed to create Redis client',
        message: error.message
      }, { status: 500 });
    }

    // Test 3: Try to connect
    try {
      console.log('🔌 Testing Redis connection...');
      await client.connect();
      console.log('✅ Redis connected successfully');
      
      // Test 4: Try a simple operation
      await client.set('test:connection', 'hello');
      const result = await client.get('test:connection');
      await client.del('test:connection');
      
      return Response.json({
        message: 'Redis connection test successful',
        testResult: result,
        redisUrlLength: redisUrl.length,
        redisUrlPreview: redisUrl.substring(0, 50) + '...'
      });
      
    } catch (error) {
      return Response.json({
        error: 'Redis connection failed',
        message: error.message,
        redisUrlLength: redisUrl.length,
        redisUrlPreview: redisUrl.substring(0, 50) + '...'
      }, { status: 500 });
    } finally {
      if (client) {
        await client.quit();
      }
    }
    
  } catch (error) {
    return Response.json({ 
      error: 'Test failed',
      message: error.message
    }, { status: 500 });
  }
}
