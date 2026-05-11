import React, { useState } from 'react';
import { Activity, TrendingDown, Zap, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import type { ActivityItem } from '../types';
import { formatDate, formatCurrency } from '../lib/utils';

interface ActivityFeedProps {
  modelId: string;
  modelName: string;
  currency: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ modelId, modelName, currency }) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  const activities: ActivityItem[] = [
    {
      id: 'act-1',
      type: 'price_change',
      title: `${modelName} price dropped -12%`,
      description: `Effective cost per 1M tokens decreased from ${formatCurrency(4.80, currency)} to ${formatCurrency(4.20, currency)}. Driven by output token pricing reduction.`,
      timestamp: '2025-02-10T14:23:00Z',
      modelId,
      value: -12,
    },
    {
      id: 'act-2',
      type: 'latency_spike',
      title: `Latency spike detected in EU-West`,
      description: `P50 latency increased by 340ms in eu-west-1 region. Provider reports elevated queue depths during peak hours.`,
      timestamp: '2025-02-10T13:15:00Z',
      modelId,
      value: 340,
    },
    {
      id: 'act-3',
      type: 'benchmark_update',
      title: `MMLU-Pro score updated`,
      description: `New evaluation run completed. Score changed from 86.2 to 88.7 (+2.5). Confidence interval tightened.`,
      timestamp: '2025-02-09T09:00:00Z',
      modelId,
      value: 2.5,
    },
    {
      id: 'act-4',
      type: 'provider_status',
      title: `Provider maintenance window completed`,
      description: `Scheduled maintenance completed successfully. All regions reporting nominal latency.`,
      timestamp: '2025-02-08T02:00:00Z',
      modelId,
    },
    {
      id: 'act-5',
      type: 'price_change',
      title: `${modelName} price increased +3.2%`,
      description: `Input token pricing adjusted due to capacity constraints in us-east-1.`,
      timestamp: '2025-02-05T11:30:00Z',
      modelId,
      value: 3.2,
    },
  ];

  const icons: Record<string, React.ReactNode> = {
    price_change: <TrendingDown size={12} className="text-aura-green" />,
    latency_spike: <Zap size={12} className="text-aura-amber" />,
    benchmark_update: <BarChart3 size={12} className="text-aura-blue" />,
    provider_status: <Activity size={12} className="text-aura-textMuted" />,
  };

  return (
    <div className="surface-card p-3">
      <h3 className="text-xs font-semibold text-aura-textPrimary uppercase tracking-wider mb-3 flex items-center gap-2">
        <Activity size={12} /> Recent Activity
      </h3>
      <div className="space-y-1">
        {activities.map(act => (
          <div key={act.id}>
            <button
              onClick={() => setExpanded(expanded === act.id ? null : act.id)}
              className="w-full flex items-start gap-2 px-2 py-2 rounded hover:bg-white/[0.03] text-left"
            >
              <div className="mt-0.5 shrink-0">{icons[act.type]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-aura-textPrimary truncate">{act.title}</span>
                  {expanded === act.id ? <ChevronUp size={12} className="text-aura-textMuted shrink-0" /> : <ChevronDown size={12} className="text-aura-textMuted shrink-0" />}
                </div>
                <div className="text-2xs text-aura-textMuted">{formatDate(act.timestamp)}</div>
              </div>
            </button>
            {expanded === act.id && (
              <div className="px-2 pb-2 pl-6">
                <div className="text-2xs text-aura-textSecondary leading-relaxed bg-aura-base rounded p-2 border border-aura-border">
                  {act.description}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
