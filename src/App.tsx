/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { Currency } from './types/currency';
import { INITIAL_CURRENCIES, DEFAULT_FAVORITES } from './data/currencies';
import { getExchangeRates } from './services/exchangeRateService';
import { TopBar } from './components/TopBar';
import { MarketHero } from './components/MarketHero';
import { Calculator } from './components/Calculator';
import { RatesTable } from './components/RatesTable';
import { AseanCorridor } from './components/AseanCorridor';
import { MasApiModal } from './components/MasApiModal';
import { Footer } from './components/Footer';

const STORAGE_FAVORITES_KEY = 'lionrate_sgd_favorites_v1';

export default function App() {
  const [currencies, setCurrencies] = useState<Currency[]>(INITIAL_CURRENCIES);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_FAVORITES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read favorites from localStorage:', e);
    }
    return DEFAULT_FAVORITES;
  });

  const [fromCurrency, setFromCurrency] = useState<string>('SGD');
  const [toCurrency, setToCurrency] = useState<string>('MYR');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isMasModalOpen, setIsMasModalOpen] = useState<boolean>(false);
  const [activeNav, setActiveNav] = useState<string>('calculator');

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.warn('Could not write favorites to localStorage:', e);
    }
  }, [favorites]);

  const handleToggleFavorite = useCallback((code: string) => {
    setFavorites((prev) => {
      if (prev.includes(code)) {
        return prev.filter((item) => item !== code);
      } else {
        return [...prev, code];
      }
    });
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Simulate real-time market tick
      const result = await getExchangeRates(currencies);
      setCurrencies(result.currencies);
      setLastUpdated(result.lastUpdated);
    } catch (error) {
      console.error('Error refreshing rates:', error);
    } finally {
      // Small timeout for smooth button feedback
      setTimeout(() => {
        setIsRefreshing(false);
      }, 350);
    }
  }, [currencies]);

  const handleSelectPair = useCallback((from: string, to: string) => {
    setFromCurrency(from);
    setToCurrency(to);
    setActiveNav('calculator');
  }, []);

  const handleSelectCurrencyForConvert = useCallback((code: string) => {
    setFromCurrency('SGD');
    setToCurrency(code);
    setActiveNav('calculator');
    document.getElementById('calculator-section')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleSwap = useCallback(() => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  }, [fromCurrency, toCurrency]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-rose-500/10 selection:text-rose-900">
      {/* Top Bar with Top Bar Contract compliance */}
      <TopBar
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onOpenMasGuide={() => setIsMasModalOpen(true)}
        activeNav={activeNav}
        onSelectNav={setActiveNav}
      />

      <main className="flex-1">
        {/* Market Crosses and Singapore Time Hero */}
        <MarketHero
          lastUpdated={lastUpdated}
          currencies={currencies}
          onSelectPair={handleSelectPair}
        />

        {/* Currency Conversion Calculator with Spread Simulator */}
        <Calculator
          currencies={currencies}
          fromCurrency={fromCurrency}
          toCurrency={toCurrency}
          onFromChange={setFromCurrency}
          onToChange={setToCurrency}
          onSwap={handleSwap}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
        />

        {/* Singapore Dollar Cross Rates Table with Search and Favorites */}
        <RatesTable
          currencies={currencies}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          onSelectCurrencyForConvert={handleSelectCurrencyForConvert}
        />

        {/* ASEAN Corridor Spotlight */}
        <AseanCorridor
          currencies={currencies}
          onSelectPair={handleSelectPair}
        />
      </main>

      {/* Footer */}
      <Footer onOpenMasGuide={() => setIsMasModalOpen(true)} />

      {/* MAS API Integration Guide Modal */}
      <MasApiModal
        isOpen={isMasModalOpen}
        onClose={() => setIsMasModalOpen(false)}
      />
    </div>
  );
}
