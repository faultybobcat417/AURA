import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { models } from '../data/mockData';
import { Sparkline } from './Sparkline';
import { formatCurrency, formatPercent, getChangeColor } from '../lib/utils';

export const Watchlist: React.FC = () => {
  const { currency, watchlist, toggleWatchlist } = useAppStore();
  const navigate = useNavigate();
  const watchedModels = watchlist.map(w => models.find(m => m.id === w.modelId)).filter(Boolean);

  if (watchedModels.length === 0) {
    return (
      <div className="surface-card p-3">
        <h3 className="text-xs font-semibold text-aura-textPrimary uppercase tracking-wider mb-2">My Watchlist</h3>
        <div className="text-center py-4 text-2xs text-aura-textMuted">
          <Star size={16} className="mx-auto mb-1 opacity-40" />
          Pin models to track them here
        </div>
      </div>
    );
  }

  return (
    <div className="surface-card p-3">
      <h3 className="text-xs font-semibold text-aura-textPrimary uppercase tracking-wider mb-2">My Watchlist</h3>
      <div className="space-y-2">
        {watchedModels.map(model => (
          <div
            key={model!.id}
            className="flex items-center justify-between px-2 py-2 rounded hover:bg-white/[0.03] group cursor-pointer"
            onClick={() => navigate(`/model/${model!.id}`)}
          >
            <div className="flex items-center gap-2">
              <button
                onClick={e => { e.stopPropagation(); toggleWatchlist(model!.id); }}
                className="text-aura-amber hover:text-aura-amber/70"
              >
                <Star size={12} fill="currentColor" />
              </button>
              <div>
                <div className="text-xs text-aura-textPrimary">{model!.name}</div>
                <div className="text-2xs text-aura-textMuted">{model!.providerName}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sparkline
                data={model!.sparkline}
                width={40}
                height={16}
                color={model!.change24h < 0 ? '#00C853' : '#FF3D00'}
              />
              <div className="text-right">
                <div className="text-xs font-mono text-aura-textPrimary">{formatCurrency(model!.effectiveCostPer1M, currency)}</div>
                <div className={`text-2xs font-mono ${getChangeColor(model!.change24h)}`}>{formatPercent(model!.change24h, true)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
