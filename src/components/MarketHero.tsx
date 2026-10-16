import React from 'react';
import { Currency } from '../types/currency';
import { TrendingUp, TrendingDown, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { formatSingaporeTime, formatCurrencyValue } from '../services/exchangeRateService';

interface MarketHeroProps {
  lastUpdated: Date;
  currencies: Currency[];
  onSelectPair: (from: string, to: string) => void;
}

export const MarketHero: React.FC<MarketHeroProps> = ({
  lastUpdated,
  currencies,
  onSelectPair,
}) => {
  // Key Singaporean benchmark pairs
  const heroCodes = ['MYR', 'USD', 'JPY', 'EUR', 'THB'];
  const heroCurrencies = heroCodes
    .map((code) => currencies.find((c) => c.code === code))
    .filter((c): c is Currency => Boolean(c));

  return (
    <section className="border-b border-slate-200 bg-white pt-8 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top metadata strip without pills */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Singapore Time (SGT UTC+8):</span>
            <span className="font-mono font-medium text-slate-700">{formatSingaporeTime(lastUpdated)}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              Live Market Rates
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Format: Aligned with Monetary Authority of Singapore (MAS) conventions</span>
          </div>
        </div>

        {/* Headline */}
        <div className="max-w-3xl mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            Real-Time SGD Exchange Rates & Currency Converter
          </h1>
          <p className="mt-2 text-base text-slate-600 leading-relaxed">
            Monitor Singapore Dollar cross rates against 30+ global currencies. Calculate money changer spreads, track official MAS quotations, and pin your daily favorites.
          </p>
        </div>

        {/* Key Benchmark Ticker Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {heroCurrencies.map((c) => {
            const isSgdBase = c.code === 'MYR' || c.code === 'JPY' || c.code === 'THB';
            // For MYR: Show 1 SGD = X MYR
            // For USD: Show 1 USD = X SGD
            const inverse = 1 / c.sgdPerUnit;
            const primaryLabel = isSgdBase ? `SGD / ${c.code}` : `${c.code} / SGD`;
            const primaryValue = isSgdBase ? formatCurrencyValue(inverse, c.code) : formatCurrencyValue(c.sgdPerUnit, 'SGD');
            const isPositive = c.change24h >= 0;

            return (
              <button
                key={c.code}
                onClick={() => {
                  if (isSgdBase) {
                    onSelectPair('SGD', c.code);
                  } else {
                    onSelectPair(c.code, 'SGD');
                  }
                  document.getElementById('calculator-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/90 rounded-xl text-left transition-all hover:border-slate-300 hover:shadow-xs cursor-pointer"
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg leading-none" role="img" aria-label={c.name}>{c.flag}</span>
                    <span className="font-semibold text-xs text-slate-800">{primaryLabel}</span>
                  </div>
                  <div className={`flex items-center gap-0.5 text-xs font-mono font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{isPositive ? `+${c.change24h}%` : `${c.change24h}%`}</span>
                  </div>
                </div>

                <div className="font-mono text-xl font-bold text-slate-900 tracking-tight mb-1">
                  {primaryValue}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="truncate">{c.name}</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-rose-600 shrink-0" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
