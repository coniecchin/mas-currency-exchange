import React from 'react';
import { RefreshCw } from 'lucide-react';

interface TopBarProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenMasGuide: () => void;
  activeNav: string;
  onSelectNav: (nav: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onRefresh,
  isRefreshing,
  onOpenMasGuide,
  activeNav,
  onSelectNav,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <a 
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            onSelectNav('calculator');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block"></span>
          <span>LionRate <span className="text-rose-600 font-extrabold">SG</span></span>
        </a>

        {/* Zone 2: 4 single-line nav links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            onClick={() => {
              onSelectNav('calculator');
              document.getElementById('calculator-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              activeNav === 'calculator' ? 'text-rose-600 font-semibold' : ''
            }`}
          >
            Converter
          </button>
          <button
            onClick={() => {
              onSelectNav('rates');
              document.getElementById('rates-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              activeNav === 'rates' ? 'text-rose-600 font-semibold' : ''
            }`}
          >
            Rates Table
          </button>
          <button
            onClick={() => {
              onSelectNav('asean');
              document.getElementById('asean-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              activeNav === 'asean' ? 'text-rose-600 font-semibold' : ''
            }`}
          >
            ASEAN Hub
          </button>
          <button
            onClick={onOpenMasGuide}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 text-slate-600"
          >
            MAS API Guide
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-98 rounded-lg transition-all shadow-xs disabled:opacity-60 whitespace-nowrap shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Rates</span>
          </button>
        </div>
      </div>
    </header>
  );
};
