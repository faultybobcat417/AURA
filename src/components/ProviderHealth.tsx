import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import { providers } from '../data/mockData';
import { getStatusColor, formatNumber } from '../lib/utils';

export const ProviderHealth: React.FC = () => {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="surface-card p-3">
      <h3 className="text-xs font-semibold text-aura-textPrimary uppercase tracking-wider mb-3">Provider Health</h3>
      <div className="space-y-2">
        {providers.map(p => (
          <div key={p.id}>
            <button
              onClick={() => setExpanded(expanded === p.id ? null : p.id)}
              className="w-full flex items-center justify-between px-2 py-2 rounded hover:bg-white/[0.03]"
            >
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(p.status)}`} />
                <span className="text-xs text-aura-textPrimary">{p.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xs font-mono text-aura-textSecondary">{formatNumber(p.uptime24h)}%</span>
                {p.latencyTrend === 'down' ? <TrendingDown size={10} className="text-aura-green" /> :
                  p.latencyTrend === 'up' ? <TrendingUp size={10} className="text-aura-red" /> :
                  <Minus size={10} className="text-aura-textMuted" />}
                {expanded === p.id ? <ChevronUp size={12} className="text-aura-textMuted" /> : <ChevronDown size={12} className="text-aura-textMuted" />}
              </div>
            </button>
            {expanded === p.id && (
              <div className="px-2 pb-2 space-y-1">
                {p.regions.map(r => (
                  <div key={r.region} className="flex items-center justify-between py-1 px-2 rounded bg-aura-base/50">
                    <span className="text-2xs text-aura-textMuted uppercase">{r.region}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xs font-mono text-aura-textSecondary">{r.p50}ms</span>
                      <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(r.status)}`} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
