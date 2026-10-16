import React, { useState, useRef, useEffect } from 'react';
import { Currency, SpreadType } from '../types/currency';
import { 
  ArrowLeftRight, 
  ChevronDown, 
  Search, 
  Info, 
  Sparkles,
  Star,
  Check
} from 'lucide-react';
import { 
  convertCurrency, 
  formatCurrencyValue, 
  SPREAD_RATES 
} from '../services/exchangeRateService';

interface CalculatorProps {
  currencies: Currency[];
  fromCurrency: string;
  toCurrency: string;
  onFromChange: (code: string) => void;
  onToChange: (code: string) => void;
  onSwap: () => void;
  favorites: string[];
  onToggleFavorite: (code: string) => void;
}

export const Calculator: React.FC<CalculatorProps> = ({
  currencies,
  fromCurrency,
  toCurrency,
  onFromChange,
  onToChange,
  onSwap,
  favorites,
  onToggleFavorite,
}) => {
  const [amount, setAmount] = useState<number>(1000);
  const [spreadType, setSpreadType] = useState<SpreadType>('mid');
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');

  const fromDropdownRef = useRef<HTMLDivElement>(null);
  const toDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (fromDropdownRef.current && !fromDropdownRef.current.contains(event.target as Node)) {
        setIsFromOpen(false);
      }
      if (toDropdownRef.current && !toDropdownRef.current.contains(event.target as Node)) {
        setIsToOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Construct options list including SGD as the primary domestic currency
  const sgdOption = {
    code: 'SGD',
    name: 'Singapore Dollar',
    country: 'Singapore',
    flag: '🇸🇬',
    symbol: 'S$',
    masUnit: 1 as const,
    sgdPerUnit: 1,
    description: 'Domestic national currency',
  };

  const allCurrencyOptions = [sgdOption, ...currencies];

  const filteredFromOptions = allCurrencyOptions.filter((c) => 
    c.code.toLowerCase().includes(searchFrom.toLowerCase()) ||
    c.name.toLowerCase().includes(searchFrom.toLowerCase()) ||
    c.country.toLowerCase().includes(searchFrom.toLowerCase())
  );

  const filteredToOptions = allCurrencyOptions.filter((c) => 
    c.code.toLowerCase().includes(searchTo.toLowerCase()) ||
    c.name.toLowerCase().includes(searchTo.toLowerCase()) ||
    c.country.toLowerCase().includes(searchTo.toLowerCase())
  );

  const selectedFrom = allCurrencyOptions.find((c) => c.code === fromCurrency) || sgdOption;
  const selectedTo = allCurrencyOptions.find((c) => c.code === toCurrency) || allCurrencyOptions[1];

  // Perform real-time conversion
  const result = convertCurrency(amount, fromCurrency, toCurrency, spreadType, currencies);
  // Also calculate comparison with standard retail bank (2.5%) for potential savings
  const bankResult = convertCurrency(amount, fromCurrency, toCurrency, 'retailBank', currencies);
  const savingsVsBank = Math.max(0, result.toAmount - bankResult.toAmount);

  // Quick amount stepper additions
  const quickIncrements = [
    { label: '+50', value: 50 },
    { label: '+100', value: 100 },
    { label: '+500', value: 500 },
    { label: '+1,000', value: 1000 },
    { label: '+5,000', value: 5000 },
  ];

  const isToFavorite = favorites.includes(toCurrency);

  return (
    <section id="calculator-section" className="py-10 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Currency Calculator
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Convert between Singapore Dollar and any global pair with transparent market rates and provider spreads.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Quotation: Real-time mid-market</span>
            <span aria-hidden="true">·</span>
            <span>Zero hidden markup</span>
          </div>
        </div>

        {/* Main Calculator Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Input and Selectors */}
              <div className="lg:col-span-7 space-y-5">
                
                {/* Amount Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="amount-input" className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                      Amount to Convert
                    </label>
                    <button
                      type="button"
                      onClick={() => setAmount(1000)}
                      className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
                    >
                      Reset to 1,000
                    </button>
                  </div>
                  
                  <div className="relative rounded-xl border border-slate-200 focus-within:border-slate-800 focus-within:ring-1 focus-within:ring-slate-800 transition-all bg-white shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-mono text-lg font-medium">
                      {selectedFrom.symbol || '$'}
                    </div>
                    <input
                      id="amount-input"
                      type="number"
                      min="0"
                      step="any"
                      value={isNaN(amount) ? '' : amount}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setAmount(isNaN(val) ? 0 : val);
                      }}
                      placeholder="0.00"
                      className="block w-full pl-12 pr-4 py-3.5 text-xl font-bold font-mono text-slate-900 placeholder:text-slate-300 focus:outline-none rounded-xl"
                    />
                  </div>

                  {/* Quick Add Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                    <span className="text-[11px] text-slate-400 font-medium mr-1">Quick Add:</span>
                    {quickIncrements.map((inc) => (
                      <button
                        key={inc.label}
                        type="button"
                        onClick={() => setAmount((prev) => (isNaN(prev) ? 0 : prev) + inc.value)}
                        className="px-2.5 py-1 text-xs font-mono font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-md transition-colors"
                      >
                        {inc.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setAmount(0)}
                      className="px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-rose-600 transition-colors ml-auto"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* From / To Currency Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-11 gap-3 items-center">
                  
                  {/* From Currency Selector */}
                  <div className="sm:col-span-5 relative" ref={fromDropdownRef}>
                    <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-1.5">
                      From Currency
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsFromOpen(!isFromOpen);
                        setIsToOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl transition-all text-left"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl leading-none" role="img" aria-label={selectedFrom.country}>{selectedFrom.flag}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-slate-900">{selectedFrom.code}</span>
                            <span className="text-xs text-slate-400">({selectedFrom.symbol})</span>
                          </div>
                          <div className="text-xs text-slate-500 truncate">{selectedFrom.name}</div>
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                    </button>

                    {/* From Dropdown */}
                    {isFromOpen && (
                      <div className="absolute z-50 mt-1.5 w-72 sm:w-80 bg-white border border-slate-200 rounded-xl shadow-lg p-2 max-h-80 overflow-y-auto">
                        <div className="relative mb-2">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                          <input
                            type="text"
                            placeholder="Search code or country..."
                            value={searchFrom}
                            onChange={(e) => setSearchFrom(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                            autoFocus
                          />
                        </div>
                        <div className="space-y-0.5">
                          {filteredFromOptions.map((item) => (
                            <button
                              key={`from-${item.code}`}
                              type="button"
                              onClick={() => {
                                onFromChange(item.code);
                                setIsFromOpen(false);
                                setSearchFrom('');
                              }}
                              className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                                item.code === fromCurrency ? 'bg-rose-50 text-rose-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-base">{item.flag}</span>
                                <div>
                                  <span className="font-bold mr-1">{item.code}</span>
                                  <span className="text-slate-500">{item.name}</span>
                                </div>
                              </div>
                              {item.code === fromCurrency && <Check className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Swap Button */}
                  <div className="sm:col-span-1 flex justify-center pt-5 sm:pt-6">
                    <button
                      type="button"
                      onClick={onSwap}
                      title="Swap currencies"
                      className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-transform active:scale-90 cursor-pointer"
                    >
                      <ArrowLeftRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* To Currency Selector */}
                  <div className="sm:col-span-5 relative" ref={toDropdownRef}>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
                        To Currency
                      </label>
                      {toCurrency !== 'SGD' && (
                        <button
                          type="button"
                          onClick={() => onToggleFavorite(toCurrency)}
                          title={isToFavorite ? 'Remove from favorites' : 'Add to favorites'}
                          className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-amber-600 transition-colors"
                        >
                          <Star className={`w-3.5 h-3.5 ${isToFavorite ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                          <span>{isToFavorite ? 'Favorited' : 'Add Favorite'}</span>
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsToOpen(!isToOpen);
                        setIsFromOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl transition-all text-left"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl leading-none" role="img" aria-label={selectedTo.country}>{selectedTo.flag}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-slate-900">{selectedTo.code}</span>
                            <span className="text-xs text-slate-400">({selectedTo.symbol})</span>
                          </div>
                          <div className="text-xs text-slate-500 truncate">{selectedTo.name}</div>
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                    </button>

                    {/* To Dropdown */}
                    {isToOpen && (
                      <div className="absolute z-50 right-0 mt-1.5 w-72 sm:w-80 bg-white border border-slate-200 rounded-xl shadow-lg p-2 max-h-80 overflow-y-auto">
                        <div className="relative mb-2">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                          <input
                            type="text"
                            placeholder="Search code or country..."
                            value={searchTo}
                            onChange={(e) => setSearchTo(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                            autoFocus
                          />
                        </div>
                        <div className="space-y-0.5">
                          {filteredToOptions.map((item) => (
                            <button
                              key={`to-${item.code}`}
                              type="button"
                              onClick={() => {
                                onToChange(item.code);
                                setIsToOpen(false);
                                setSearchTo('');
                              }}
                              className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                                item.code === toCurrency ? 'bg-rose-50 text-rose-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-base">{item.flag}</span>
                                <div>
                                  <span className="font-bold mr-1">{item.code}</span>
                                  <span className="text-slate-500">{item.name}</span>
                                </div>
                              </div>
                              {item.code === toCurrency && <Check className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rate Spread / Provider Simulator */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                      Exchange Provider Fee Tier
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Simulate real-world exchange costs
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(Object.keys(SPREAD_RATES) as SpreadType[]).map((type) => {
                      const spreadInfo = SPREAD_RATES[type];
                      const isSelected = spreadType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setSpreadType(type)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="font-semibold text-xs leading-tight mb-0.5">{spreadInfo.label}</div>
                          <div className={`text-[11px] font-mono ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                            {spreadInfo.feePercent === 0 ? '0.00% fee' : `+${spreadInfo.feePercent}% fee`}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Right Column: Prominent Calculation Output */}
              <div className="lg:col-span-5 bg-slate-900 text-white rounded-xl p-6 flex flex-col justify-between min-h-[360px]">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>You are converting</span>
                    <span className="font-mono text-slate-300">{selectedFrom.code} → {selectedTo.code}</span>
                  </div>

                  <div className="text-sm font-medium text-slate-400 mb-1">
                    {formatCurrencyValue(amount, fromCurrency)} {fromCurrency} =
                  </div>

                  <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-white mb-2">
                    {formatCurrencyValue(result.toAmount, toCurrency)} <span className="text-xl sm:text-2xl font-bold text-rose-400">{toCurrency}</span>
                  </div>

                  {/* Provider fee note */}
                  {spreadType !== 'mid' && (
                    <div className="text-xs text-amber-300/90 font-mono mb-4 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Includes est. {result.spreadPercent}% markup (~{formatCurrencyValue(result.feeAmount, toCurrency)} {toCurrency})
                      </span>
                    </div>
                  )}

                  {/* Savings highlight vs retail bank */}
                  {spreadType !== 'retailBank' && savingsVsBank > 0 && (
                    <div className="mt-3 p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-lg text-emerald-300 text-xs flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-emerald-200">You save approx. {formatCurrencyValue(savingsVsBank, toCurrency)} {toCurrency}</span> compared to a typical retail bank OTC credit card FX rate (2.50%).
                      </div>
                    </div>
                  )}
                </div>

                {/* Inverse and Official MAS Breakdown */}
                <div className="mt-6 pt-5 border-t border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Mid-market conversion:</span>
                    <span className="font-mono font-medium">
                      1 {fromCurrency} = {formatCurrencyValue(result.midMarketRate, toCurrency)} {toCurrency}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Inverse rate:</span>
                    <span className="font-mono font-medium">
                      1 {toCurrency} = {formatCurrencyValue(1 / result.midMarketRate, fromCurrency)} {fromCurrency}
                    </span>
                  </div>

                  {result.masQuotedRate && (
                    <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/60">
                      <span>MAS reporting standard:</span>
                      <span className="font-mono text-slate-300">{result.masQuotedRate}</span>
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
