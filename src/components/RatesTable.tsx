import React, { useState, useMemo } from 'react';
import { Currency } from '../types/currency';
import { 
  Search, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpDown, 
  ArrowRight, 
  LayoutGrid, 
  Table as TableIcon,
  X,
  Filter
} from 'lucide-react';
import { formatCurrencyValue } from '../services/exchangeRateService';

interface RatesTableProps {
  currencies: Currency[];
  favorites: string[];
  onToggleFavorite: (code: string) => void;
  onSelectCurrencyForConvert: (code: string) => void;
}

type TabCategory = 'all' | 'favorites' | 'asean' | 'travel' | 'majors';
type SortField = 'code' | 'sgdRate' | 'inverseRate' | 'change';
type SortOrder = 'asc' | 'desc';

export const RatesTable: React.FC<RatesTableProps> = ({
  currencies,
  favorites,
  onToggleFavorite,
  onSelectCurrencyForConvert,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabCategory>('all');
  const [sortField, setSortField] = useState<SortField>('code');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [useMasUnits, setUseMasUnits] = useState(true);

  // Filter list based on tab & search query
  const filteredCurrencies = useMemo(() => {
    return currencies.filter((item) => {
      // Tab filter
      if (activeTab === 'favorites') {
        if (!favorites.includes(item.code)) return false;
      } else if (activeTab === 'asean') {
        if (item.region !== 'ASEAN') return false;
      } else if (activeTab === 'travel') {
        if (!item.category.includes('travel')) return false;
      } else if (activeTab === 'majors') {
        if (!item.category.includes('majors')) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchCode = item.code.toLowerCase().includes(query);
        const matchName = item.name.toLowerCase().includes(query);
        const matchCountry = item.country.toLowerCase().includes(query);
        return matchCode || matchName || matchCountry;
      }

      return true;
    });
  }, [currencies, activeTab, favorites, searchQuery]);

  // Sort list
  const sortedCurrencies = useMemo(() => {
    return [...filteredCurrencies].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'code') {
        comparison = a.code.localeCompare(b.code);
      } else if (sortField === 'sgdRate') {
        comparison = a.sgdPerUnit - b.sgdPerUnit;
      } else if (sortField === 'inverseRate') {
        comparison = (1 / a.sgdPerUnit) - (1 / b.sgdPerUnit);
      } else if (sortField === 'change') {
        comparison = a.change24h - b.change24h;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredCurrencies, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Sparkline renderer
  const renderSparkline = (data: number[], isPositive: boolean) => {
    if (!data || data.length < 2) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 80;
    const height = 24;

    const points = data
      .map((val, idx) => {
        const x = (idx / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 6) - 3;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

    const strokeColor = isPositive ? '#16A34A' : '#DC2626';

    return (
      <svg width={width} height={height} className="overflow-visible inline-block">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <section id="rates-section" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Singapore Dollar (SGD) Cross Rates
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Live spot exchange rates against 30+ currencies with 24-hour ranges and MAS official reporting units.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                aria-label="Table view"
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Controls: Search, Tabs & MAS Quoting Toggle */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative w-full lg:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search currency, code (e.g. MYR, JPY), or country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-slate-800 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* MAS Unit Switch & Result Count */}
            <div className="flex items-center gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700">
                <input
                  type="checkbox"
                  checked={useMasUnits}
                  onChange={(e) => setUseMasUnits(e.target.checked)}
                  className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <span className="font-medium">Use MAS Quoting Format (per 100 JPY/IDR/KRW/VND/TWD)</span>
              </label>

              <span className="text-slate-400 hidden sm:inline">|</span>
              <span className="text-slate-500 hidden sm:inline">
                Showing <strong className="text-slate-800 font-mono">{sortedCurrencies.length}</strong> currencies
              </span>
            </div>

          </div>

          {/* Interactive Filter Tabs (Functional segmented buttons) */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl max-w-fit">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Currencies ({currencies.length})
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'favorites'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Favorites ({favorites.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('asean')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'asean'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ASEAN Corridor
            </button>
            <button
              onClick={() => setActiveTab('travel')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'travel'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Travel Hotspots
            </button>
            <button
              onClick={() => setActiveTab('majors')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'majors'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              G10 Majors
            </button>
          </div>
        </div>

        {/* Empty State */}
        {sortedCurrencies.length === 0 && (
          <div className="py-16 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50">
            <Filter className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No currencies match your filters</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {activeTab === 'favorites' && favorites.length === 0
                ? "You haven't added any favorite currencies yet. Click the star icon on any currency to pin it here."
                : 'Try adjusting your search query or switching to another category.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveTab('all');
              }}
              className="mt-4 px-4 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* View Mode: Table */}
        {sortedCurrencies.length > 0 && viewMode === 'table' && (
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                    <th scope="col" className="py-3 px-3 w-10 text-center">
                      <span className="sr-only">Favorite</span>
                    </th>
                    <th scope="col" className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleSort('code')}
                        className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"
                      >
                        <span>Currency</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </button>
                    </th>
                    <th scope="col" className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleSort('sgdRate')}
                        className="flex items-center gap-1.5 ml-auto hover:text-slate-900 transition-colors"
                      >
                        <span>SGD Equivalent</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </button>
                    </th>
                    <th scope="col" className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleSort('inverseRate')}
                        className="flex items-center gap-1.5 ml-auto hover:text-slate-900 transition-colors"
                      >
                        <span>Units per 1 SGD</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </button>
                    </th>
                    <th scope="col" className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleSort('change')}
                        className="flex items-center gap-1.5 ml-auto hover:text-slate-900 transition-colors"
                      >
                        <span>24h Change</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </button>
                    </th>
                    <th scope="col" className="py-3 px-4 text-right hidden md:table-cell">
                      <span>24h High / Low</span>
                    </th>
                    <th scope="col" className="py-3 px-4 text-center hidden lg:table-cell">
                      <span>7-Day Trend</span>
                    </th>
                    <th scope="col" className="py-3 px-4 text-right">
                      <span className="sr-only">Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedCurrencies.map((c) => {
                    const isFav = favorites.includes(c.code);
                    const isPositive = c.change24h >= 0;
                    const isMas100 = useMasUnits && c.masUnit === 100;

                    // Display rate based on MAS convention toggle
                    const displayUnit = isMas100 ? 100 : 1;
                    const rateInSgd = isMas100 ? c.sgdPerUnit * 100 : c.sgdPerUnit;
                    const inverseRate = 1 / c.sgdPerUnit;

                    return (
                      <tr
                        key={c.code}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        {/* Favorite Star */}
                        <td className="py-3.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => onToggleFavorite(c.code)}
                            title={isFav ? 'Remove favorite' : 'Pin to favorites'}
                            className="p-1 rounded-md text-slate-300 hover:text-amber-500 transition-colors"
                          >
                            <Star className={`w-4 h-4 ${isFav ? 'text-amber-500 fill-amber-500' : ''}`} />
                          </button>
                        </td>

                        {/* Currency Info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl leading-none" role="img" aria-label={c.country}>{c.flag}</span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-sm text-slate-900 font-mono">{c.code}</span>
                                {isMas100 && (
                                  <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                                    per 100
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 truncate max-w-[160px] sm:max-w-[220px]">
                                {c.name} · <span className="text-slate-400">{c.country}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* SGD Equivalent */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="font-mono font-bold text-sm text-slate-900 tabular-nums">
                            S$ {formatCurrencyValue(rateInSgd, 'SGD')}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            per {displayUnit} {c.code}
                          </div>
                        </td>

                        {/* Inverse (Units per 1 SGD) */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="font-mono font-medium text-slate-800 tabular-nums">
                            {formatCurrencyValue(inverseRate, c.code)} {c.code}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            per S$1.00
                          </div>
                        </td>

                        {/* 24h Change */}
                        <td className="py-3.5 px-4 text-right">
                          <div className={`inline-flex items-center gap-1 font-mono font-semibold tabular-nums ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                            <span>{isPositive ? `+${c.change24h}%` : `${c.change24h}%`}</span>
                          </div>
                        </td>

                        {/* 24h High / Low */}
                        <td className="py-3.5 px-4 text-right hidden md:table-cell font-mono text-[11px] text-slate-500 tabular-nums">
                          <div>H: {formatCurrencyValue(isMas100 ? c.high24h * 100 : c.high24h, 'SGD')}</div>
                          <div>L: {formatCurrencyValue(isMas100 ? c.low24h * 100 : c.low24h, 'SGD')}</div>
                        </td>

                        {/* 7-Day Sparkline */}
                        <td className="py-3.5 px-4 text-center hidden lg:table-cell">
                          {renderSparkline(c.sparkline, isPositive)}
                        </td>

                        {/* Quick Convert Action */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => onSelectCurrencyForConvert(c.code)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-900 hover:text-white rounded-lg transition-colors whitespace-nowrap shrink-0"
                          >
                            <span>Convert</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* View Mode: Card Grid */}
        {sortedCurrencies.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedCurrencies.map((c) => {
              const isFav = favorites.includes(c.code);
              const isPositive = c.change24h >= 0;
              const isMas100 = useMasUnits && c.masUnit === 100;
              const displayUnit = isMas100 ? 100 : 1;
              const rateInSgd = isMas100 ? c.sgdPerUnit * 100 : c.sgdPerUnit;
              const inverseRate = 1 / c.sgdPerUnit;

              return (
                <div
                  key={c.code}
                  className="p-5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-3xl leading-none" role="img" aria-label={c.country}>{c.flag}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-base font-mono text-slate-900">{c.code}</span>
                            {isMas100 && (
                              <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1 py-0.5 rounded">
                                /100
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 truncate max-w-[140px]">{c.name}</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onToggleFavorite(c.code)}
                        className="p-1 text-slate-300 hover:text-amber-500 transition-colors"
                      >
                        <Star className={`w-4 h-4 ${isFav ? 'text-amber-500 fill-amber-500' : ''}`} />
                      </button>
                    </div>

                    {/* Rates */}
                    <div className="space-y-1 mb-4">
                      <div className="text-xs text-slate-400">Singapore Dollar Equivalent</div>
                      <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                        S$ {formatCurrencyValue(rateInSgd, 'SGD')}
                        <span className="text-xs font-normal text-slate-400 ml-1">/ {displayUnit} {c.code}</span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono tabular-nums">
                        S$1.00 = {formatCurrencyValue(inverseRate, c.code)} {c.code}
                      </div>
                    </div>

                    {/* Change & Sparkline */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                      <div className={`flex items-center gap-1 font-mono font-semibold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        <span>{isPositive ? `+${c.change24h}%` : `${c.change24h}%`}</span>
                      </div>
                      <div>
                        {renderSparkline(c.sparkline, isPositive)}
                      </div>
                    </div>
                  </div>

                  {/* Convert CTA */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => onSelectCurrencyForConvert(c.code)}
                      className="w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Convert SGD to {c.code}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
