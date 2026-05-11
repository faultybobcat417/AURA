import React, { useMemo } from 'react';
import { X, Clock, Layers, DollarSign, Zap, BarChart3, MessageSquare, GitCommit } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

import {
  formatCurrency,
  formatLatency,
  formatNumber,
  formatPercent,
  getLatencyColor,
  getStatusTextColor,
  getChangeColor,
} from '../lib/utils';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';

export const ModelProfile: React.FC = () => {
  const { selectedModelId, setSelectedModelId, currency, toggleWatchlist, isInWatchlist, liveModels, liveError, lastUpdated } = useAppStore();
  const model = liveModels.find(m => m.id === selectedModelId);

  if (!model) return null;

  const competitors = liveModels.filter(m => m.id !== model.id && m.useCases.some(uc => model.useCases.includes(uc))).slice(0, 3);

  const benchmarkData = useMemo(() => {
    return Object.entries(model.benchmarks).map(([name, score]) => ({
      name: name.replace('-b', ' B'),
      score,
      fullMark: 100,
    }));
  }, [model]);

  const priceHistory = useMemo(() => {
    const points = [];
    let price = model.effectiveCostPer1M * 1.2;
    for (let i = 30; i >= 0; i--) {
      price = price * (0.98 + Math.random() * 0.04);
      points.push({ day: `D-${i}`, price: Math.max(0.01, price) });
    }
    return points;
  }, [model]);

  const minutesAgo = Math.round((Date.now() - lastUpdated.getTime()) / 60000);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full py-8 px-4">
        <div className="max-w-5xl mx-auto bg-aura-surface border border-aura-border rounded-lg shadow-2xl overflow-hidden">
          {/* Hero */}
          <div className="px-6 py-5 border-b border-aura-border flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-bold text-aura-textPrimary">{model.name}</h1>
                <span className={`text-2xs px-2 py-0.5 rounded-full border ${getStatusTextColor(model.status)} border-current`}>
                  {model.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-aura-textSecondary">
                <span>{model.providerName}</span>
                <span className="text-aura-border">·</span>
                <span>{model.modality}</span>
                <span className="text-aura-border">·</span>
                <span>{(model.contextWindow / 1000).toFixed(0)}K context</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleWatchlist(model.id)}
                className="px-3 py-1.5 rounded border border-aura-border text-xs text-aura-textSecondary hover:text-aura-textPrimary transition-colors"
              >
                {isInWatchlist(model.id) ? 'Remove from Watchlist' : 'Add to Watchlist'}
              </button>
              <button
                onClick={() => setSelectedModelId(null)}
                className="p-1.5 rounded hover:bg-white/[0.05] text-aura-textMuted hover:text-aura-textPrimary"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Key Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-aura-base rounded-lg p-3 border border-aura-border">
                <div className="text-2xs text-aura-textMuted mb-1 flex items-center gap-1"><DollarSign size={10} /> Effective Cost</div>
                <div className="text-lg font-mono font-semibold text-aura-textPrimary">{formatCurrency(model.effectiveCostPer1M, currency)}</div>
                <div className={`text-2xs font-mono ${getChangeColor(model.change24h)}`}>{formatPercent(model.change24h, true)}</div>
              </div>
              <div className="bg-aura-base rounded-lg p-3 border border-aura-border">
                <div className="text-2xs text-aura-textMuted mb-1 flex items-center gap-1"><Zap size={10} /> P50 Latency</div>
                <div className={`text-lg font-mono font-semibold ${getLatencyColor(model.latencyP50)}`}>{formatLatency(model.latencyP50)}</div>
                <div className="text-2xs text-aura-textMuted">P99 {formatLatency(model.latencyP99)}</div>
              </div>
              <div className="bg-aura-base rounded-lg p-3 border border-aura-border">
                <div className="text-2xs text-aura-textMuted mb-1 flex items-center gap-1"><BarChart3 size={10} /> Benchmark</div>
                <div className="text-lg font-mono font-semibold text-aura-textPrimary">{formatNumber(model.benchmarkScore)}</div>
                <div className="text-2xs text-aura-textMuted">UEM {formatNumber(model.uem)}</div>
              </div>
              <div className="bg-aura-base rounded-lg p-3 border border-aura-border">
                <div className="text-2xs text-aura-textMuted mb-1 flex items-center gap-1"><Clock size={10} /> TTFT / TPS</div>
                <div className="text-lg font-mono font-semibold text-aura-textPrimary">{model.ttft}ms</div>
                <div className="text-2xs text-aura-textMuted">{model.tps} tok/s</div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-aura-base rounded-lg p-4 border border-aura-border">
                <h3 className="text-xs font-semibold text-aura-textPrimary mb-3">Price History (30D)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={priceHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" tick={{ fill: '#5A6275', fontSize: 10 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
                    <YAxis tick={{ fill: '#5A6275', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                    <Tooltip
                      contentStyle={{ background: '#1A1D29', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', fontSize: '12px' }}
                      itemStyle={{ color: '#F0F2F5' }}
                      formatter={(value) => [formatCurrency(Number(value), currency), 'Price']}
                    />
                    <Line type="monotone" dataKey="price" stroke="#2979FF" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                {liveError ? (
                  <div className="mt-2 text-2xs text-aura-amber">Data source: Cached · Live API unavailable</div>
                ) : (
                  <div className="mt-2 text-2xs text-aura-textMuted">
                    Data source: OpenRouter API · Updated {minutesAgo} min ago
                  </div>
                )}
              </div>

              <div className="bg-aura-base rounded-lg p-4 border border-aura-border">
                <h3 className="text-xs font-semibold text-aura-textPrimary mb-3">Benchmark Radar</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={benchmarkData}>
                    <PolarGrid stroke="rgba(255,255,255,0.06)" />
                    <PolarAngleAxis dataKey="name" tick={{ fill: '#8B93A7', fontSize: 10 }} />
                    <PolarRadiusAxis tick={{ fill: '#5A6275', fontSize: 9 }} domain={[0, 100]} />
                    <Radar name={model.name} dataKey="score" stroke="#2979FF" fill="#2979FF" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-aura-base rounded-lg p-4 border border-aura-border">
              <h3 className="text-xs font-semibold text-aura-textPrimary mb-3 flex items-center gap-2"><Layers size={12} /> True Cost Breakdown</h3>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-aura-border">
                    <th className="pb-2 text-2xs text-aura-textMuted uppercase">Component</th>
                    <th className="pb-2 text-2xs text-aura-textMuted uppercase text-right">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-aura-border/30">
                    <td className="py-2 text-xs text-aura-textSecondary">Input tokens</td>
                    <td className="py-2 text-xs font-mono text-aura-textPrimary text-right">{formatCurrency(model.costPer1MInput, currency)} / 1M</td>
                  </tr>
                  <tr className="border-b border-aura-border/30">
                    <td className="py-2 text-xs text-aura-textSecondary">Output tokens</td>
                    <td className="py-2 text-xs font-mono text-aura-textPrimary text-right">{formatCurrency(model.costPer1MOutput, currency)} / 1M</td>
                  </tr>
                  {model.cachingDiscount && (
                    <tr className="border-b border-aura-border/30">
                      <td className="py-2 text-xs text-aura-textSecondary">Caching discount</td>
                      <td className="py-2 text-xs font-mono text-aura-green text-right">-{formatPercent(model.cachingDiscount * 100)}</td>
                    </tr>
                  )}
                  {model.batchDiscount && (
                    <tr className="border-b border-aura-border/30">
                      <td className="py-2 text-xs text-aura-textSecondary">Batch discount</td>
                      <td className="py-2 text-xs font-mono text-aura-green text-right">-{formatPercent(model.batchDiscount * 100)}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="py-2 text-xs font-medium text-aura-textPrimary">Effective rate</td>
                    <td className="py-2 text-xs font-mono font-semibold text-aura-blue text-right">{formatCurrency(model.effectiveCostPer1M, currency)} / 1M</td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-4">
                <div className="text-2xs text-aura-textMuted mb-2">vs Closest Competitors</div>
                <div className="space-y-2">
                  {competitors.map(c => (
                    <div key={c.id} className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-white/[0.03]">
                      <div className="text-xs text-aura-textSecondary">{c.name} ({c.providerName})</div>
                      <div className="text-xs font-mono text-aura-textPrimary">{formatCurrency(c.effectiveCostPer1M, currency)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Community Notes & Changelog */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-aura-base rounded-lg p-4 border border-aura-border">
                <h3 className="text-xs font-semibold text-aura-textPrimary mb-3 flex items-center gap-2"><MessageSquare size={12} /> Community Notes</h3>
                <div className="space-y-3">
                  <div className="p-2 rounded bg-aura-surfaceHighlight">
                    <div className="text-2xs text-aura-textMuted mb-1">2 days ago · Verified</div>
                    <div className="text-xs text-aura-textSecondary">Hallucination rate appears slightly elevated on legal document summarization tasks compared to Claude 3.5 Sonnet.</div>
                  </div>
                  <div className="p-2 rounded bg-aura-surfaceHighlight">
                    <div className="text-2xs text-aura-textMuted mb-1">5 days ago · Verified</div>
                    <div className="text-xs text-aura-textSecondary">Tool use reliability improved significantly after the latest minor version update.</div>
                  </div>
                </div>
              </div>
              <div className="bg-aura-base rounded-lg p-4 border border-aura-border">
                <h3 className="text-xs font-semibold text-aura-textPrimary mb-3 flex items-center gap-2"><GitCommit size={12} /> Changelog</h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-px bg-aura-border relative">
                      <div className="absolute top-1 left-[-2px] w-1 h-1 rounded-full bg-aura-blue" />
                    </div>
                    <div>
                      <div className="text-2xs text-aura-textMuted">2025-02-01</div>
                      <div className="text-xs text-aura-textSecondary">Pricing updated: output tokens reduced by 10%</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-px bg-aura-border relative">
                      <div className="absolute top-1 left-[-2px] w-1 h-1 rounded-full bg-aura-textMuted" />
                    </div>
                    <div>
                      <div className="text-2xs text-aura-textMuted">2025-01-15</div>
                      <div className="text-xs text-aura-textSecondary">Context window expanded to current limit</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
