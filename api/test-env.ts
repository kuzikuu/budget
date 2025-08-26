export async function GET() {
  try {
    const redisUrl = process.env.REDIS_URL;
    const nodeEnv = process.env.NODE_ENV;
    
    return Response.json({
      message: 'Environment variables test',
      hasRedisUrl: !!redisUrl,
      redisUrlLength: redisUrl ? redisUrl.length : 0,
      redisUrlPreview: redisUrl ? redisUrl.substring(0, 50) + '...' : 'NOT SET',
      nodeEnv: nodeEnv || 'NOT SET',
      allEnvKeys: Object.keys(process.env).filter(key => key.includes('REDIS') || key.includes('VERCEL'))
    });
  } catch (error) {
    return Response.json({ 
      error: 'Failed to check environment',
      message: error.message
    }, { status: 500 });
  }
}
