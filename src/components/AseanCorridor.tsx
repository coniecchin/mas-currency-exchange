import React, { useState } from 'react';
import { Currency } from '../types/currency';
import { formatCurrencyValue } from '../services/exchangeRateService';
import { ArrowRight, PlaneTakeoff, ShoppingBag, Coffee, Fuel } from 'lucide-react';

interface AseanCorridorProps {
  currencies: Currency[];
  onSelectPair: (from: string, to: string) => void;
}

export const AseanCorridor: React.FC<AseanCorridorProps> = ({
  currencies,
  onSelectPair,
}) => {
  const [budgetSgd, setBudgetSgd] = useState<number>(100);

  const keyCorridorCodes = ['MYR', 'THB', 'IDR', 'JPY', 'VND', 'PHP'];
  const corridorCurrencies = keyCorridorCodes
    .map((code) => currencies.find((c) => c.code === code))
    .filter((c): c is Currency => Boolean(c));

  const budgetOptions = [50, 100, 250, 500, 1000];

  // Practical Singaporean travel benchmarks
  const contextNotes: Record<string, { label: string; icon: React.ReactNode; estimate: string }> = {
    MYR: {
      label: 'Johor Bahru Weekend & Causeway',
      icon: <Fuel className="w-4 h-4 text-amber-600" />,
      estimate: 'Fuel, grocery stocking & seafood dining in JB',
    },
    THB: {
      label: 'Bangkok Weekend Getaway',
      icon: <ShoppingBag className="w-4 h-4 text-emerald-600" />,
      estimate: 'Night markets, street food & cafes in Sukhumvit',
    },
    IDR: {
      label: 'Batam / Bintan Ferry Trip',
      icon: <PlaneTakeoff className="w-4 h-4 text-blue-600" />,
      estimate: 'Short ferry spa retreats, resorts & fresh seafood',
    },
    JPY: {
      label: 'Tokyo / Osaka Holiday Travel',
      icon: <Coffee className="w-4 h-4 text-rose-600" />,
      estimate: 'Conbini runs, ramen dining & Shinkansen travel',
    },
    VND: {
      label: 'Ho Chi Minh / Da Nang Vacation',
      icon: <Coffee className="w-4 h-4 text-amber-700" />,
      estimate: 'Specialty drip coffee, pho, and coastal resorts',
    },
    PHP: {
      label: 'Boracay / Cebu Island Retreat',
      icon: <PlaneTakeoff className="w-4 h-4 text-indigo-600" />,
      estimate: 'Island hopping, diving and leisure stays',
    },
  };

  return (
    <section id="asean-section" className="py-12 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-rose-600 mb-1">
              Regional Travel & Cross-Border Hub
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              ASEAN & Holiday Travel Corridor
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Compare how far your Singapore Dollar goes across high-frequency regional corridors and popular holiday spots.
            </p>
          </div>

          {/* Budget Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-xs">
            <span className="text-xs text-slate-400 font-medium px-2">Budget:</span>
            {budgetOptions.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setBudgetSgd(amt)}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded-lg transition-colors ${
                  budgetSgd === amt
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                S${amt}
              </button>
            ))}
          </div>
        </div>

        {/* Corridor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {corridorCurrencies.map((c) => {
            const unitsReceived = budgetSgd / c.sgdPerUnit;
            const context = contextNotes[c.code];

            return (
              <div
                key={c.code}
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl leading-none" role="img" aria-label={c.country}>{c.flag}</span>
                      <div>
                        <div className="font-bold text-sm text-slate-900">{c.country}</div>
                        <div className="text-xs text-slate-500 font-mono">{c.code} ({c.symbol})</div>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-medium text-slate-500">
                      1 S$ = {formatCurrencyValue(1 / c.sgdPerUnit, c.code)}
                    </span>
                  </div>

                  {/* Value received */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-3">
                    <div className="text-[11px] text-slate-500 mb-1">
                      For S${budgetSgd} SGD you get:
                    </div>
                    <div className="font-mono text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
                      {formatCurrencyValue(unitsReceived, c.code)} <span className="text-base text-slate-600 font-semibold">{c.code}</span>
                    </div>
                  </div>

                  {/* Context Note */}
                  {context && (
                    <div className="flex items-start gap-2.5 text-xs text-slate-600 mt-2">
                      <div className="p-1 rounded-md bg-slate-100 shrink-0 mt-0.5">
                        {context.icon}
                      </div>
                      <div>
                        <div className="font-medium text-slate-800">{context.label}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">{context.estimate}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    MAS Unit: {c.masUnit === 100 ? 'Per 100' : 'Per 1'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectPair('SGD', c.code);
                      document.getElementById('calculator-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                  >
                    <span>Open in Calculator</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
