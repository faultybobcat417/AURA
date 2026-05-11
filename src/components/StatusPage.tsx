import React, { useState } from 'react';
import { Globe, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { providers, uptimeRecords } from '../data/mockData';
import { getStatusColor, formatNumber, formatLatency } from '../lib/utils';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

export const StatusPage: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const providerUptime = providers.map(p => {
    const records = uptimeRecords.filter(r => r.providerId === p.id);
    const avg30d = records.slice(-30).reduce((s, r) => s + r.uptime, 0) / 30;
    const avg60d = records.slice(-60).reduce((s, r) => s + r.uptime, 0) / 60;
    const avg90d = records.reduce((s, r) => s + r.uptime, 0) / records.length;
    return { ...p, avg30d, avg60d, avg90d, records };
  });

  const selectedUptimeData = selectedProvider
    ? uptimeRecords.filter(r => r.providerId === selectedProvider).map(r => ({ date: r.date, uptime: r.uptime }))
    : [];

  return (
    <div className="min-h-screen pt-28 px-6 pb-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-aura-textPrimary">API Status</h1>
          <p className="text-sm text-aura-textSecondary mt-1">Real-time provider health from global probe network</p>
        </div>

        {/* Global Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {providerUptime.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedProvider(selectedProvider === p.id ? null : p.id)}
              className={`surface-card p-3 text-left hover:border-aura-textMuted/30 transition-colors ${selectedProvider === p.id ? 'border-aura-blue' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(p.status)}`} />
                  <span className="text-xs font-medium text-aura-textPrimary">{p.name}</span>
                </div>
                {p.status === 'operational' ? <Wifi size={12} className="text-aura-green" /> :
                  p.status === 'degraded' ? <AlertTriangle size={12} className="text-aura-amber" /> :
                  <WifiOff size={12} className="text-aura-red" />}
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-2xs text-aura-textMuted">30d uptime</span>
                  <span className="text-xs font-mono text-aura-textPrimary">{formatNumber(p.avg30d)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xs text-aura-textMuted">60d uptime</span>
                  <span className="text-xs font-mono text-aura-textPrimary">{formatNumber(p.avg60d)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xs text-aura-textMuted">90d uptime</span>
                  <span className="text-xs font-mono text-aura-textPrimary">{formatNumber(p.avg90d)}%</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-aura-border flex items-center gap-2">
                <Globe size={10} className="text-aura-textMuted" />
                <span className="text-2xs text-aura-textMuted">{p.regions.length} regions probed</span>
              </div>
            </button>
          ))}
        </div>

        {/* Regional Matrix */}
        <div className="surface-card p-4 mb-6 overflow-x-auto">
          <h3 className="text-xs font-semibold text-aura-textPrimary uppercase tracking-wider mb-3">Regional Latency Matrix</h3>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-aura-border">
                <th className="pb-2 text-2xs text-aura-textMuted uppercase">Provider</th>
                {providers[0]?.regions.map(r => (
                  <th key={r.region} className="pb-2 text-2xs text-aura-textMuted uppercase text-right">{r.region}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {providers.map(p => (
                <tr key={p.id} className="border-b border-aura-border/30 hover:bg-white/[0.02]">
                  <td className="py-2 text-xs text-aura-textPrimary">{p.name}</td>
                  {p.regions.map(r => (
                    <td key={r.region} className="py-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-xs font-mono text-aura-textSecondary">{formatLatency(r.p50)}</span>
                        <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(r.status)}`} />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Historical Uptime Chart */}
        {selectedProvider && (
          <div className="surface-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-aura-textPrimary uppercase tracking-wider">
                {providers.find(p => p.id === selectedProvider)?.name} — 90 Day Uptime
              </h3>
              <button onClick={() => setSelectedProvider(null)} className="text-2xs text-aura-textMuted hover:text-aura-textPrimary">Close</button>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={selectedUptimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: '#5A6275', fontSize: 10 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
                <YAxis domain={[98, 100]} tick={{ fill: '#5A6275', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip contentStyle={{ background: '#1A1D29', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', fontSize: '12px' }} formatter={(value) => [`${Number(value).toFixed(3)}%`, 'Uptime']} />
                <Line type="monotone" dataKey="uptime" stroke="#00C853" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
