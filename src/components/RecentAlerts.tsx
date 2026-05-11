import React, { useState, useEffect, useRef } from 'react';
import { Bell, AlertTriangle, TrendingDown, TrendingUp, Zap, Sparkles } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { formatDate } from '../lib/utils';
import type { AlertType } from '../types';

const alertIcons: Record<string, React.ReactNode> = {
  price_drop: <TrendingDown size={12} className="text-aura-green" />,
  price_spike: <TrendingUp size={12} className="text-aura-red" />,
  latency_spike: <Zap size={12} className="text-aura-amber" />,
  new_model: <Sparkles size={12} className="text-aura-blue" />,
  outage: <AlertTriangle size={12} className="text-aura-red" />,
};

interface GeneratedAlert {
  id: string;
  type: AlertType;
  modelId?: string;
  title: string;
  description: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

export const RecentAlerts: React.FC = () => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<GeneratedAlert[]>([]);
  const liveModels = useAppStore(state => state.liveModels);
  const liveLoading = useAppStore(state => state.liveLoading);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (liveLoading) {
      hasFetchedRef.current = true;
      return;
    }
    if (liveModels.length === 0) return;

    const baselineJson = localStorage.getItem('aura-baseline-prices');
    const baseline: Record<string, { effectiveCostPer1M: number; latencyP50: number }> = baselineJson ? JSON.parse(baselineJson) : {};
    const hasBaseline = Object.keys(baseline).length > 0;

    const newAlerts: GeneratedAlert[] = [];
    const liveIds = new Set(liveModels.map(m => m.id));

    if (hasBaseline && hasFetchedRef.current) {
      for (const model of liveModels) {
        const base = baseline[model.id];
        if (!base) {
          newAlerts.push({
            id: `new-${model.id}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            type: 'new_model',
            modelId: model.id,
            title: `${model.name} added to live feed`,
            description: `Model ${model.name} (${model.providerName}) is now available.`,
            timestamp: new Date().toISOString(),
            severity: 'low',
          });
          continue;
        }

        const costChange = base.effectiveCostPer1M > 0
          ? (model.effectiveCostPer1M - base.effectiveCostPer1M) / base.effectiveCostPer1M
          : 0;

        if (costChange < -0.05) {
          newAlerts.push({
            id: `drop-${model.id}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            type: 'price_drop',
            modelId: model.id,
            title: `${model.name} price dropped (${(costChange * 100).toFixed(1)}%)`,
            description: `Effective cost decreased from ${base.effectiveCostPer1M.toFixed(2)} to ${model.effectiveCostPer1M.toFixed(2)} per 1M tokens.`,
            timestamp: new Date().toISOString(),
            severity: 'medium',
          });
        } else if (costChange > 0.05) {
          newAlerts.push({
            id: `spike-${model.id}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            type: 'price_spike',
            modelId: model.id,
            title: `${model.name} price increased (${(costChange * 100).toFixed(1)}%)`,
            description: `Effective cost increased from ${base.effectiveCostPer1M.toFixed(2)} to ${model.effectiveCostPer1M.toFixed(2)} per 1M tokens.`,
            timestamp: new Date().toISOString(),
            severity: 'high',
          });
        }

        const latChange = base.latencyP50 > 0
          ? (model.latencyP50 - base.latencyP50) / base.latencyP50
          : 0;

        if (latChange > 0.20) {
          newAlerts.push({
            id: `lat-${model.id}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            type: 'latency_spike',
            modelId: model.id,
            title: `${model.name} latency spike (+${(latChange * 100).toFixed(0)}%)`,
            description: `P50 latency increased from ${base.latencyP50}ms to ${model.latencyP50}ms.`,
            timestamp: new Date().toISOString(),
            severity: 'medium',
          });
        }
      }

      for (const id of Object.keys(baseline)) {
        if (!liveIds.has(id)) {
          newAlerts.push({
            id: `outage-${id}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            type: 'outage',
            modelId: id,
            title: `${id} removed from live feed`,
            description: `Model ${id} is no longer available in the live data feed.`,
            timestamp: new Date().toISOString(),
            severity: 'high',
          });
        }
      }
    }

    const newBaseline = Object.fromEntries(
      liveModels.map(m => [m.id, { effectiveCostPer1M: m.effectiveCostPer1M, latencyP50: m.latencyP50 }])
    );
    localStorage.setItem('aura-baseline-prices', JSON.stringify(newBaseline));

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 10));
    }
  }, [liveModels, liveLoading]);

  return (
    <div className="surface-card p-3">
      <h3 className="text-xs font-semibold text-aura-textPrimary uppercase tracking-wider mb-3 flex items-center gap-2">
        <Bell size={12} /> Recent Alerts
      </h3>
      <div className="space-y-2">
        {alerts.map(alert => (
          <div key={alert.id}>
            <button
              onClick={() => setExpanded(expanded === alert.id ? null : alert.id)}
              className="w-full flex items-start gap-2 px-2 py-2 rounded hover:bg-white/[0.03] text-left"
            >
              <div className="mt-0.5 shrink-0">{alertIcons[alert.type]}</div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-aura-textPrimary truncate">{alert.title}</div>
                <div className="text-2xs text-aura-textMuted">{formatDate(alert.timestamp)}</div>
              </div>
            </button>
            {expanded === alert.id && (
              <div className="px-2 pb-2 pl-7">
                <div className="text-2xs text-aura-textSecondary leading-relaxed bg-aura-base rounded p-2">
                  {alert.description}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
