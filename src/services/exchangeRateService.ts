import { Currency, ConversionResult, SpreadType } from '../types/currency';
import { INITIAL_CURRENCIES } from '../data/currencies';

/**
 * Monetary Authority of Singapore (MAS) API Configuration Template
 * 
 * When you are ready to connect to the MAS API, replace the mock generator below
 * with a fetch call using your MAS API Key and Resource ID.
 * 
 * MAS API Documentation:
 * https://eservices.mas.gov.sg/statistics/masexchangerates/
 * Datastore Endpoint:
 * https://eservices.mas.gov.sg/api/action/datastore/search.json?resource_id=2ee79667-e95d-4188-beee-01f65345a201
 */
export const MAS_CONFIG = {
  ENDPOINT: 'https://eservices.mas.gov.sg/api/action/datastore/search.json',
  EXCHANGE_RATES_RESOURCE_ID: '2ee79667-e95d-4188-beee-01f65345a201',
  LAST_KNOWN_SYNC: new Date().toISOString(),
};

export const SPREAD_RATES: Record<SpreadType, { label: string; feePercent: number; exampleVendor: string }> = {
  mid: {
    label: 'Mid-Market (Interbank)',
    feePercent: 0,
    exampleVendor: 'Official MAS / Reuters reference',
  },
  fintech: {
    label: 'Multi-Currency Card',
    feePercent: 0.35,
    exampleVendor: 'YouTrip, Wise, Revolut (~0.3% - 0.4%)',
  },
  changer: {
    label: 'Money Changer',
    feePercent: 0.90,
    exampleVendor: 'Arcade Raffles Place, Mustafa, Changi (~0.8% - 1.2%)',
  },
  retailBank: {
    label: 'Retail Bank Card / OTC',
    feePercent: 2.50,
    exampleVendor: 'Traditional credit card FX admin fee (~2.5% - 3.25%)',
  },
};

/**
 * Fetches current exchange rate dataset.
 * Currently uses high-precision realistic MAS benchmarks, ready to switch to live MAS fetch.
 */
export async function getExchangeRates(currentData?: Currency[]): Promise<{
  currencies: Currency[];
  lastUpdated: Date;
  source: 'MAS_SIMULATION' | 'MAS_API';
}> {
  // Check if MAS API Key is provided via Vite client env
  const masApiKey = import.meta.env.VITE_MAS_API_KEY;

  if (masApiKey) {
    try {
      // Direct MAS API fetch template (can be uncommented once key is authorized)
      const res = await fetch(
        `${MAS_CONFIG.ENDPOINT}?resource_id=${MAS_CONFIG.EXCHANGE_RATES_RESOURCE_ID}&limit=100`,
        {
          headers: {
            'x-api-key': masApiKey,
          },
        }
      );
      if (res.ok) {
        // Will parse MAS records when active
        console.log('Successfully connected to MAS API');
      }
    } catch (e) {
      console.warn('MAS API endpoint fallback to benchmark data:', e);
    }
  }

  // High-fidelity local rates with micro-market movement
  const sourceList = currentData && currentData.length > 0 ? currentData : INITIAL_CURRENCIES;

  // Add realistic micro-variations (within +/- 0.05%) to simulate real-time live trading
  const updated = sourceList.map((c) => {
    const deltaPercent = (Math.random() - 0.49) * 0.001; // ~0.05% fluctuation
    const newRate = Number((c.sgdPerUnit * (1 + deltaPercent)).toFixed(7));
    const newChange = Number((c.change24h + deltaPercent * 10).toFixed(2));
    const newHigh = Math.max(c.high24h, newRate);
    const newLow = Math.min(c.low24h, newRate);

    // Update sparkline with the latest tick
    const newSparkline = [...c.sparkline.slice(1), newRate];

    return {
      ...c,
      sgdPerUnit: newRate,
      change24h: newChange,
      high24h: newHigh,
      low24h: newLow,
      sparkline: newSparkline,
    };
  });

  return {
    currencies: updated,
    lastUpdated: new Date(),
    source: 'MAS_SIMULATION',
  };
}

/**
 * Calculates conversion between any two currencies.
 * Supports SGD <-> Foreign and Cross-rates (e.g. MYR <-> JPY).
 */
export function convertCurrency(
  amount: number,
  fromCode: string,
  toCode: string,
  spreadType: SpreadType,
  currencies: Currency[]
): ConversionResult {
  const safeAmount = Math.max(0, isNaN(amount) ? 0 : amount);
  const spread = SPREAD_RATES[spreadType].feePercent / 100;

  // Find rate relative to SGD:
  // 1 unit of foreign = X SGD
  // 1 SGD = 1 SGD
  const getRateToSgd = (code: string): number => {
    if (code === 'SGD') return 1;
    const c = currencies.find((item) => item.code === code);
    return c ? c.sgdPerUnit : 1;
  };

  const fromRateToSgd = getRateToSgd(fromCode);
  const toRateToSgd = getRateToSgd(toCode);

  // Cross rate: 1 From = how many To
  // (From -> SGD) / (To -> SGD)
  const midMarketRate = fromRateToSgd / toRateToSgd;

  // When buying 'toCode', the spread reduces the final received amount:
  const effectiveRate = midMarketRate * (1 - spread);
  const grossToAmount = safeAmount * midMarketRate;
  const toAmount = safeAmount * effectiveRate;
  const feeAmountInTo = grossToAmount - toAmount;

  // Format MAS convention quote
  let masQuotedRate = '';
  if (fromCode === 'SGD') {
    const toCur = currencies.find((c) => c.code === toCode);
    if (toCur) {
      if (toCur.masUnit === 100) {
        const sgdPer100 = (toCur.sgdPerUnit * 100).toFixed(4);
        masQuotedRate = `MAS Quote: S$${sgdPer100} per 100 ${toCode}`;
      } else {
        masQuotedRate = `MAS Quote: S$${toCur.sgdPerUnit.toFixed(4)} per 1 ${toCode}`;
      }
    }
  } else if (toCode === 'SGD') {
    const fromCur = currencies.find((c) => c.code === fromCode);
    if (fromCur) {
      if (fromCur.masUnit === 100) {
        const sgdPer100 = (fromCur.sgdPerUnit * 100).toFixed(4);
        masQuotedRate = `MAS Quote: S$${sgdPer100} per 100 ${fromCode}`;
      } else {
        masQuotedRate = `MAS Quote: S$${fromCur.sgdPerUnit.toFixed(4)} per 1 ${fromCode}`;
      }
    }
  }

  return {
    fromAmount: safeAmount,
    fromCode,
    toAmount,
    toCode,
    effectiveRate,
    midMarketRate,
    spreadPercent: SPREAD_RATES[spreadType].feePercent,
    feeAmount: feeAmountInTo,
    masQuotedRate,
  };
}

/**
 * Format numbers with proper decimal precision based on magnitude
 */
export function formatCurrencyValue(value: number, currencyCode: string): string {
  if (value === 0) return '0.00';

  // Specific high-volume Asian currencies with large nominal figures
  if (['IDR', 'VND', 'KRW'].includes(currencyCode)) {
    return new Intl.NumberFormat('en-SG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  if (['JPY'].includes(currencyCode)) {
    return new Intl.NumberFormat('en-SG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  }

  // Small fractional rates
  if (value < 0.01) {
    return value.toFixed(6);
  } else if (value < 1) {
    return value.toFixed(4);
  }

  return new Intl.NumberFormat('en-SG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value);
}

/**
 * Format date in Singapore Time (SGT UTC+8)
 */
export function formatSingaporeTime(date: Date): string {
  return new Intl.DateTimeFormat('en-SG', {
    timeZone: 'Asia/Singapore',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
