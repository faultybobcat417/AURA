import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { marketMovers } from '../data/mockData';
import { formatPercent } from '../lib/utils';

export const MarketMovers: React.FC = () => {
  const navigate = useNavigate();
  const gainers = marketMovers.filter(m => m.type === 'gainer').slice(0, 5);
  const losers = marketMovers.filter(m => m.type === 'loser').slice(0, 5);
  const newListings = marketMovers.filter(m => m.type === 'new').slice(0, 4);

  return (
    <div className="surface-card p-3">
      <h3 className="text-xs font-semibold text-aura-textPrimary uppercase tracking-wider mb-3">Market Movers</h3>

      <div className="mb-4">
        <div className="text-2xs font-medium text-aura-green mb-1.5 flex items-center gap-1">
          <TrendingDown size={10} /> Top Gainers (Price Drop)
        </div>
        <div className="space-y-1">
          {gainers.map(m => (
            <button
              key={`gainer-${m.modelId}`}
              onClick={() => navigate(`/model/${m.modelId}`)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-white/[0.03] text-left"
            >
              <div>
                <span className="text-xs text-aura-textPrimary">{m.modelName}</span>
                <span className="text-2xs text-aura-textMuted ml-1">{m.providerName}</span>
              </div>
              <span className="text-xs font-mono text-aura-green">{formatPercent(m.change)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="text-2xs font-medium text-aura-red mb-1.5 flex items-center gap-1">
          <TrendingUp size={10} /> Top Losers (Price Spike)
        </div>
        <div className="space-y-1">
          {losers.map(m => (
            <button
              key={`loser-${m.modelId}`}
              onClick={() => navigate(`/model/${m.modelId}`)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-white/[0.03] text-left"
            >
              <div>
                <span className="text-xs text-aura-textPrimary">{m.modelName}</span>
                <span className="text-2xs text-aura-textMuted ml-1">{m.providerName}</span>
              </div>
              <span className="text-xs font-mono text-aura-red">+{formatPercent(m.change)}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-2xs font-medium text-aura-blue mb-1.5 flex items-center gap-1">
          <Sparkles size={10} /> New Listings
        </div>
        <div className="space-y-1">
          {newListings.map(m => (
            <button
              key={`new-${m.modelId}`}
              onClick={() => navigate(`/model/${m.modelId}`)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-white/[0.03] text-left"
            >
              <span className="text-xs text-aura-textPrimary">{m.modelName}</span>
              <span className="text-2xs font-mono px-1.5 py-0.5 rounded bg-aura-blue/15 text-aura-blue">NEW</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
