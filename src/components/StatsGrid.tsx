import React from 'react';
import { Zap, DollarSign, BarChart3, Activity, Server, TrendingUp, Award } from 'lucide-react';
import type { Model, Provider } from '../types';
import { formatCurrency, formatLatency, formatNumber, getLatencyColor } from '../lib/utils';

interface StatsGridProps {
  model: Model;
  provider: Provider;
  currency: string;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ model, provider, currency }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      <StatCard icon={<DollarSign size={12} />} label="Effective Cost" value={formatCurrency(model.effectiveCostPer1M, currency)} />
      <StatCard icon={<Zap size={12} />} label="P50 Latency" value={formatLatency(model.latencyP50)} valueColor={getLatencyColor(model.latencyP50)} />
      <StatCard icon={<Zap size={12} />} label="P90 Latency" value={formatLatency(model.latencyP90)} valueColor={getLatencyColor(model.latencyP90)} />
      <StatCard icon={<Zap size={12} />} label="P99 Latency" value={formatLatency(model.latencyP99)} valueColor={getLatencyColor(model.latencyP99)} />
      <StatCard icon={<BarChart3 size={12} />} label="Benchmark" value={formatNumber(model.benchmarkScore)} />
      <StatCard icon={<TrendingUp size={12} />} label="UEM" value={model.uem > 100 ? '∞' : formatNumber(model.uem)} valueColor="text-aura-blue" />
      <StatCard icon={<Activity size={12} />} label="Uptime 24h" value={`${formatNumber(provider.uptime24h)}%`} />
      <StatCard icon={<Activity size={12} />} label="Uptime 7d" value={`${formatNumber(provider.uptime7d)}%`} />
      <StatCard icon={<Activity size={12} />} label="Uptime 30d" value={`${formatNumber(provider.uptime30d)}%`} />
      <StatCard icon={<Server size={12} />} label="TTFT" value={`${model.ttft}ms`} />
      <StatCard icon={<Server size={12} />} label="Throughput" value={`${model.tps} tok/s`} />
      <StatCard icon={<Award size={12} />} label="Context" value={`${(model.contextWindow / 1000).toFixed(0)}K`} />
      {model.arenaRank && (
        <StatCard icon={<Award size={12} />} label="Arena Rank" value={`#${model.arenaRank}`} />
      )}
      {model.arenaElo && (
        <StatCard icon={<Award size={12} />} label="Arena ELO" value={formatNumber(model.arenaElo)} />
      )}
    </div>
  );
};

function StatCard({ icon, label, value, valueColor }: { icon: React.ReactNode; label: string; value: string; valueColor?: string }) {
  return (
    <div className="bg-aura-base rounded border border-aura-border p-2.5">
      <div className="flex items-center gap-1.5 text-aura-textMuted mb-1">
        {icon}
        <span className="text-2xs">{label}</span>
      </div>
      <div className={`text-sm font-mono font-semibold ${valueColor || 'text-aura-textPrimary'}`}>{value}</div>
    </div>
  );
}
