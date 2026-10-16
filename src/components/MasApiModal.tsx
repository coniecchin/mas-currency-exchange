import React, { useState } from 'react';
import { X, Copy, Check, Code, ExternalLink, ShieldCheck, Database, Key, Activity, RefreshCw } from 'lucide-react';

interface MasApiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MasApiModal: React.FC<MasApiModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

  const masEndpoint =
    'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily?end_of_day=2026-10-14';

  const sampleSnippet = `// Serverless API handler in /api/exchangerates.ts
// Uses KeyId header from environment variable MAS_KEY_ID

const MAS_API_BASE_URL = 'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily';

export default async function handler(req, res) {
  const masKeyId = process.env.MAS_KEY_ID;
  const targetDate = req.query.end_of_day || '2026-10-14';

  const response = await fetch(\`\${MAS_API_BASE_URL}?end_of_day=\${targetDate}\`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'KeyId': masKeyId,
    },
  });

  const data = await response.json();
  return res.json({ success: true, data });
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestStatus(null);
    try {
      const res = await fetch('/api/health');
      const healthData = await res.json();
      
      const rateRes = await fetch('/api/exchangerates');
      const rateData = await rateRes.json();

      setTestStatus(
        JSON.stringify(
          {
            health: healthData.status,
            masApiConfigured: healthData.masApiConfigured,
            ratesEndpointSource: rateData.source,
            message: rateData.hint || rateData.message || 'Endpoint active',
          },
          null,
          2
        )
      );
    } catch (err: any) {
      setTestStatus(`Error testing serverless API: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
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
                MAS API Catalogue Serverless Gateway
              </h2>
              <p className="text-xs text-slate-500">
                Monetary Authority of Singapore (MAS) Daily End-of-Period Exchange Rates
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
          
          {/* Status callout */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Serverless Handlers Ready in /api</span>
            </div>
            <p className="leading-relaxed">
              The project root <code className="px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded font-mono">/api</code> directory contains serverless handlers <code className="px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded font-mono">/api/health.ts</code> and <code className="px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded font-mono">/api/exchangerates.ts</code>. Simply configure your <code className="px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded font-mono">MAS_KEY_ID</code> in the environment.
            </p>
          </div>

          {/* Integration Specs */}
          <div>
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-rose-600" />
              <span>MAS API Catalogue Specification</span>
            </h3>
            <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-mono text-[11px]">
              <div>
                <span className="text-slate-400">Target Endpoint:</span>
                <div className="text-slate-800 break-all mt-0.5">{masEndpoint}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Header:</span>
                <span className="text-rose-600 font-semibold">KeyId: &lt;MAS_KEY_ID&gt;</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Serverless Gateway Route:</span>
                <span className="text-slate-800 font-semibold">GET /api/exchangerates</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Health Probe Route:</span>
                <span className="text-slate-800 font-semibold">GET /api/health</span>
              </div>
            </div>
          </div>

          {/* Test Live Connection */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-600" />
                <span className="font-semibold text-slate-800">Test Serverless API Connection</span>
              </div>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>Probe /api Endpoints</span>
              </button>
            </div>

            {testStatus && (
              <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto">
                {testStatus}
              </pre>
            )}
          </div>

          {/* Code Snippet */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-slate-600" />
                <span>/api/exchangerates.ts Implementation</span>
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
              <code>{sampleSnippet}</code>
            </pre>
          </div>

          {/* External Links */}
          <div className="text-[11px] text-slate-500 space-y-1">
            <p>
              To provide your key, set <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">MAS_KEY_ID</code> in your <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">.env</code> file. No keys are hardcoded in the codebase.
            </p>
            <p>
              Official portal:{' '}
              <a
                href="https://eservices.mas.gov.sg/statistics/masexchangerates/"
                target="_blank"
                rel="noreferrer"
                className="text-rose-600 hover:underline inline-flex items-center gap-1 font-medium"
              >
                <span>MAS Statistical Bulletin Exchange Rates</span>
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
