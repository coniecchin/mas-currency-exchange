export type Region = 
  | 'ASEAN' 
  | 'East Asia' 
  | 'Americas' 
  | 'Europe' 
  | 'Oceania' 
  | 'South Asia & Middle East';

export type SpreadType = 'mid' | 'fintech' | 'changer' | 'retailBank';

export interface Currency {
  code: string;
  name: string;
  country: string;
  flag: string;
  symbol: string;
  region: Region;
  /**
   * MAS quoting convention:
   * JPY, IDR, KRW, VND, TWD are traditionally quoted per 100 units in Singapore
   */
  masUnit: 1 | 100;
  /**
   * Rate in SGD per single unit of foreign currency
   * (e.g. 1 USD = 1.3145 SGD, 1 JPY = 0.00875 SGD)
   */
  sgdPerUnit: number;
  change24h: number;
  high24h: number;
  low24h: number;
  sparkline: number[];
  masSeriesCode: string;
  category: ('travel' | 'majors' | 'asean')[];
  description: string;
}

export interface ConversionResult {
  fromAmount: number;
  fromCode: string;
  toAmount: number;
  toCode: string;
  effectiveRate: number;
  midMarketRate: number;
  spreadPercent: number;
  feeAmount: number;
  masQuotedRate: string;
}

export interface MasApiResponseFormat {
  success: boolean;
  result: {
    resource_id: string;
    records: Array<Record<string, string | number>>;
    total: number;
  };
}
