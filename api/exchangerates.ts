import type { Request, Response } from 'express';

const MAS_API_BASE_URL =
  'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily';

/**
 * Returns formatted date string YYYY-MM-DD in Singapore Time (UTC+8)
 */
function getRecentSingaporeDate(offsetDays = 0): string {
  const now = new Date();
  // Singapore is UTC+8
  const sgtOffset = 8 * 60;
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const sgtDate = new Date(utc + sgtOffset * 60000);
  sgtDate.setDate(sgtDate.getDate() - offsetDays);

  const year = sgtDate.getFullYear();
  const month = String(sgtDate.getMonth() + 1).padStart(2, '0');
  const day = String(sgtDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Serverless MAS Exchange Rates Handler
 * Route: GET /api/exchangerates
 * 
 * Supports:
 * ?end_of_day=YYYY-MM-DD (Defaults to current/yesterday SGT)
 */
export default async function handler(req: Request, res: Response) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, KeyId');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Retrieve API KeyId from environment variable (do not hardcode)
  const masKeyId = process.env.MAS_KEY_ID || process.env.MAS_API_KEY;

  // Determine requested end_of_day date
  const requestedDate =
    typeof req.query.end_of_day === 'string' && req.query.end_of_day.trim()
      ? req.query.end_of_day.trim()
      : getRecentSingaporeDate(1); // Default to previous day as daily end-of-period is published post-market

  // If KeyId is not configured in environment
  if (!masKeyId) {
    return res.status(200).json({
      success: false,
      source: 'MOCK_PENDING_KEY',
      error: 'MAS_KEY_ID environment variable is not set.',
      hint: 'Set MAS_KEY_ID in your environment (.env or Cloud hosting settings). The API endpoint will automatically query MAS live data once provided.',
      endpoint: `${MAS_API_BASE_URL}?end_of_day=${requestedDate}`,
      requiredHeader: 'KeyId: <YOUR_MAS_KEY_ID>',
      dateQueried: requestedDate,
    });
  }

  try {
    const targetUrl = `${MAS_API_BASE_URL}?end_of_day=${encodeURIComponent(requestedDate)}`;

    const masResponse = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        KeyId: masKeyId,
      },
    });

    if (!masResponse.ok) {
      const errText = await masResponse.text();
      return res.status(masResponse.status).json({
        success: false,
        source: 'MAS_API_ERROR',
        status: masResponse.status,
        statusText: masResponse.statusText,
        error: `MAS API responded with status ${masResponse.status}`,
        details: errText,
        endpoint: targetUrl,
      });
    }

    const data = await masResponse.json();

    return res.status(200).json({
      success: true,
      source: 'MAS_API_LIVE',
      end_of_day: requestedDate,
      endpoint: targetUrl,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Error contacting MAS API catalogue:', err);
    return res.status(500).json({
      success: false,
      source: 'GATEWAY_ERROR',
      error: err.message || 'Failed to connect to MAS Exchange Rates Catalogue',
    });
  }
}

// Export Web Standard GET handler for edge/Vercel serverless functions
export async function GET(request: Request) {
  const url = new URL(request.url, 'http://localhost:3000');
  const dateParam = url.searchParams.get('end_of_day') || getRecentSingaporeDate(1);
  const masKeyId = process.env.MAS_KEY_ID || process.env.MAS_API_KEY;

  if (!masKeyId) {
    return new Response(
      JSON.stringify({
        success: false,
        source: 'MOCK_PENDING_KEY',
        error: 'MAS_KEY_ID is missing in environment variables.',
        targetDate: dateParam,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const targetUrl = `${MAS_API_BASE_URL}?end_of_day=${encodeURIComponent(dateParam)}`;
    const masRes = await fetch(targetUrl, {
      headers: {
        Accept: 'application/json',
        KeyId: masKeyId,
      },
    });

    const body = await masRes.text();
    return new Response(body, {
      status: masRes.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ success: false, error: e.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
