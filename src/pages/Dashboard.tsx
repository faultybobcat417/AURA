import React, { useEffect } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useLiveData } from '../hooks/useLiveData';
import { MarketMovers } from '../components/MarketMovers';
import { ProviderHealth } from '../components/ProviderHealth';
import { Watchlist } from '../components/Watchlist';
import { ComparisonTable } from '../components/ComparisonTable';
import { CostCalculator } from '../components/CostCalculator';
import { RecentAlerts } from '../components/RecentAlerts';
import { formatDate } from '../lib/utils';

export const Dashboard: React.FC = () => {
  const { lastUpdated, refreshData, liveError } = useAppStore();
  const { models, loading, error, refetch } = useLiveData();

  useEffect(() => {
    useAppStore.getState().setLiveModels(models);
  }, [models]);

  useEffect(() => {
    useAppStore.getState().setLiveLoading(loading);
  }, [loading]);

  useEffect(() => {
    useAppStore.getState().setLiveError(error);
  }, [error]);

  return (
    <div className="pt-28 px-4 pb-8">
      <div className="max-w-[1600px] mx-auto">
        {liveError && (
          <div className="mb-4 px-3 py-2 rounded bg-aura-amber/10 border border-aura-amber/20 text-xs text-aura-amber flex items-center gap-2">
            <AlertTriangle size={14} />
            Live data unavailable — showing cached prices
          </div>
        )}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-aura-textPrimary uppercase tracking-wider">Market Overview</h2>
          <button
            onClick={() => refreshData(refetch)}
            className="flex items-center gap-1.5 text-2xs text-aura-textMuted hover:text-aura-textSecondary transition-colors"
          >
            <RefreshCw size={10} /> Last updated {formatDate(lastUpdated.toISOString())}
          </button>
        </div>

        <div className="flex gap-4">
          {/* Left Column */}
          <div className="w-[280px] shrink-0 space-y-4">
            <MarketMovers />
            <ProviderHealth />
            <Watchlist />
          </div>

          {/* Center Column */}
          <div className="flex-1 min-w-[600px]">
            <ComparisonTable />
          </div>

          {/* Right Column */}
          <div className="w-[320px] shrink-0 space-y-4">
            <CostCalculator />
            <RecentAlerts />
          </div>
        </div>
      </div>
    </div>
  );
};
