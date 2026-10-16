import React, { useState } from 'react';
import { X, Copy, Check, Code, ExternalLink, ShieldCheck, Database, Key } from 'lucide-react';
import { MAS_CONFIG } from '../services/exchangeRateService';

interface MasApiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MasApiModal: React.FC<MasApiModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sampleBackendSnippet = `// Backend or Express route template for MAS API integration
// Place in /server.ts or /api/exchange-rates.ts

import express from 'express';

const app = express();
const MAS_API_KEY = process.env.MAS_API_KEY || '';
const MAS_RESOURCE_ID = '${MAS_CONFIG.EXCHANGE_RATES_RESOURCE_ID}';

app.get('/api/mas/rates', async (req, res) => {
  try {
    const url = \`https://eservices.mas.gov.sg/api/action/datastore/search.json?resource_id=\${MAS_RESOURCE_ID}&limit=100\`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        ...(MAS_API_KEY ? { 'x-api-key': MAS_API_KEY } : {}),
      },
    });

    if (!response.ok) {
      throw new Error(\`MAS API responded with status \${response.status}\`);
    }

    const data = await response.json();
    // Return sanitized records to frontend
    res.json({
      success: true,
      records: data.result?.records || [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('MAS API integration error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch MAS rates' });
  }
});`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleBackendSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mas-modal-title"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 id="mas-modal-title" className="text-lg font-bold text-slate-900">
                MAS API Backend Integration Guide
              </h2>
              <p className="text-xs text-slate-500">
                Monetary Authority of Singapore (MAS) Developer Datastore API
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-600">
          
          {/* Quick status callout */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Front-End UI is Fully Pre-Wired</span>
            </div>
            <p className="leading-relaxed">
              LionRate SG currently operates with high-fidelity realistic benchmark rates matching MAS official quoting conventions (including 100-unit standards for JPY, IDR, KRW, VND, and TWD). When you add your backend proxy or MAS API key, the service layer in <code className="px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded font-mono">src/services/exchangeRateService.ts</code> is ready to receive live records.
            </p>
          </div>

          {/* Integration Specs */}
          <div>
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-rose-600" />
              <span>MAS Datastore Specifications</span>
            </h3>
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-mono text-[11px]">
              <div>
                <span className="text-slate-400">Endpoint:</span>{' '}
                <span className="text-slate-800 break-all">{MAS_CONFIG.ENDPOINT}</span>
              </div>
              <div>
                <span className="text-slate-400">Resource ID:</span>{' '}
                <span className="text-rose-600 font-semibold">{MAS_CONFIG.EXCHANGE_RATES_RESOURCE_ID}</span>
              </div>
              <div>
                <span className="text-slate-400">Frequency:</span> Daily end-of-period official quotes published around 4:30 PM SGT
              </div>
            </div>
          </div>

          {/* Pre-written Code Snippet */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-slate-600" />
                <span>Backend Proxy Snippet</span>
              </h3>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed">
              <code>{sampleBackendSnippet}</code>
            </pre>
          </div>

          {/* Environment Variable note */}
          <div className="text-[11px] text-slate-500 space-y-1">
            <p>
              To add your key, add <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">MAS_API_KEY</code> to your backend <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">.env</code> or forward it via your proxy headers.
            </p>
            <p>
              External link:{' '}
              <a
                href="https://eservices.mas.gov.sg/statistics/masexchangerates/"
                target="_blank"
                rel="noreferrer"
                className="text-rose-600 hover:underline inline-flex items-center gap-1 font-medium"
              >
                <span>MAS Official Exchange Rates Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
