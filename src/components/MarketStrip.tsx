import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkline } from './Sparkline';
import { useAppStore } from '../store/useAppStore';
import { models } from '../data/mockData';
import { formatCurrency, formatPercent, getLatencyColor, getChangeColor } from '../lib/utils';

export const MarketStrip: React.FC = () => {
  const { currency } = useAppStore();
  const navigate = useNavigate();
  const [isPaused, setIsPaused] = useState(false);
  const topModels = [...models].sort((a, b) => b.uem - a.uem).slice(0, 10);

  const tickerContent = (
    <>
      {topModels.map(model => (
        <button
          key={model.id}
          onClick={() => navigate(`/model/${model.id}`)}
          className="flex items-center gap-3 px-4 py-2 border-r border-aura-border hover:bg-white/[0.03] transition-colors shrink-0"
        >
          <div className="flex flex-col items-start min-w-[100px]">
            <span className="text-xs font-medium text-aura-textPrimary whitespace-nowrap">{model.name}</span>
            <span className="text-2xs text-aura-textMuted">{model.providerName}</span>
          </div>
          <div className="flex flex-col items-end min-w-[80px]">
            <span className="text-xs font-mono text-aura-textPrimary">{formatCurrency(model.effectiveCostPer1M, currency)}</span>
            <span className={`text-2xs font-mono ${getChangeColor(model.change24h)}`}>
              {formatPercent(model.change24h, true)}
            </span>
          </div>
          <Sparkline
            data={model.sparkline}
            width={50}
            height={18}
            color={model.change24h < 0 ? '#00C853' : model.change24h > 0 ? '#FF3D00' : '#8B93A7'}
          />
          <div className={`text-2xs font-mono px-1.5 py-0.5 rounded bg-white/5 ${getLatencyColor(model.latencyP50)}`}>
            P50 {model.latencyP50}ms
          </div>
        </button>
      ))}
    </>
  );

  return (
    <div
      className="fixed top-12 left-0 right-0 z-40 h-16 bg-aura-base border-b border-aura-border overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={`flex items-center h-full ${isPaused ? '' : 'animate-ticker-scroll'}`} style={{ width: 'max-content' }}>
        {tickerContent}
        {tickerContent}
      </div>
    </div>
  );
};
