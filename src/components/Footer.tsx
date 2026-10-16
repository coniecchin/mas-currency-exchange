import React from 'react';
import { ExternalLink } from 'lucide-react';

interface FooterProps {
  onOpenMasGuide: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenMasGuide }) => {
  return (
    <footer className="bg-white border-t border-slate-200 py-10 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Main Footer Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-rose-600 inline-block"></span>
              <span>LionRate SG</span>
            </div>
            <p className="text-slate-500 max-w-md">
              Singapore Dollar (SGD) foreign exchange rates dashboard, currency calculator, and ASEAN regional travel comparisons.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs">
            <button
              onClick={onOpenMasGuide}
              className="hover:text-slate-900 transition-colors"
            >
              MAS API Documentation
            </button>
            <a
              href="https://eservices.mas.gov.sg/statistics/masexchangerates/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-900 transition-colors inline-flex items-center gap-1"
            >
              <span>Monetary Authority of Singapore</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>
            Disclaimer: Indicative rates for research, budget planning, and reference. Over-the-counter money changers and commercial financial institutions apply independent spreads.
          </p>
          <div className="whitespace-nowrap font-mono text-slate-400 shrink-0">
            Singapore SGT (UTC+8)
          </div>
        </div>

      </div>
    </footer>
  );
};
