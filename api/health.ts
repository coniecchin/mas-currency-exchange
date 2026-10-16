import type { Request, Response } from 'express';

/**
 * Serverless Health Check Handler
 * Route: GET /api/health
 */
export default async function handler(req: Request, res: Response) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, KeyId');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const hasMasKey = Boolean(process.env.MAS_KEY_ID || process.env.MAS_API_KEY);

  return res.status(200).json({
    status: 'ok',
    service: 'MAS Currency Exchange API Gateway',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    masApiConfigured: hasMasKey,
    masEndpoint: 'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily',
    message: hasMasKey
      ? 'MAS KeyId configured. Live rates can be fetched from MAS API Catalogue.'
      : 'MAS_KEY_ID environment variable is pending configuration. Using benchmark rates.',
  });
}

// Export Web Standard GET handler for edge/serverless compatibility
export async function GET() {
  const hasMasKey = Boolean(process.env.MAS_KEY_ID || process.env.MAS_API_KEY);
  return new Response(
    JSON.stringify({
      status: 'ok',
      service: 'MAS Currency Exchange API Gateway',
      timestamp: new Date().toISOString(),
      masApiConfigured: hasMasKey,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
