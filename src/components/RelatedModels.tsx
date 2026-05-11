import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { models } from '../data/mockData';
import type { Model } from '../types';
import { formatCurrency, formatPercent, getChangeColor } from '../lib/utils';
import { useAppStore } from '../store/useAppStore';

interface RelatedModelsProps {
  currentModel: Model;
}

export const RelatedModels: React.FC<RelatedModelsProps> = ({ currentModel }) => {
  const navigate = useNavigate();
  const { currency, toggleWatchlist, isInWatchlist } = useAppStore();

  const related = useMemo(() => {
    return models
      .filter(m => m.id !== currentModel.id)
      .map(m => {
        const useCaseOverlap = m.useCases.filter(uc => currentModel.useCases.includes(uc)).length;
        const priceDiff = Math.abs(m.effectiveCostPer1M - currentModel.effectiveCostPer1M);
        const score = useCaseOverlap * 10 - priceDiff;
        return { model: m, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(r => r.model);
  }, [currentModel]);

  return (
    <div className="surface-card p-3">
      <h3 className="text-xs font-semibold text-aura-textPrimary uppercase tracking-wider mb-3">Related Models</h3>
      <div className="space-y-1.5">
        {related.map(model => (
          <div
            key={model.id}
            className="flex items-center justify-between px-2 py-2 rounded hover:bg-white/[0.03] group cursor-pointer"
            onClick={() => navigate(`/model/${model.id}`)}
          >
            <div className="flex items-center gap-2">
              <button
                onClick={e => { e.stopPropagation(); toggleWatchlist(model.id); }}
                className="text-aura-textMuted hover:text-aura-amber"
              >
                <Star size={10} className={isInWatchlist(model.id) ? 'fill-aura-amber text-aura-amber' : ''} />
              </button>
              <div>
                <div className="text-xs text-aura-textPrimary group-hover:text-aura-blue transition-colors">{model.name}</div>
                <div className="text-2xs text-aura-textMuted">{model.providerName}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono text-aura-textPrimary">{formatCurrency(model.effectiveCostPer1M, currency)}</div>
              <div className={`text-2xs font-mono ${getChangeColor(model.change24h)}`}>{formatPercent(model.change24h, true)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
