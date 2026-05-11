import React, { useState } from 'react';
import { Bell, BellRing, Trash2, Plus, TrendingDown, TrendingUp } from 'lucide-react';
import { useAlertStore } from '../store/alertStore';
import type { Model } from '../types';
import { formatCurrency, cn } from '../lib/utils';

interface AlertWidgetProps {
  model: Model;
  currency: string;
  presetPrice?: number | null;
}

export const AlertWidget: React.FC<AlertWidgetProps> = ({ model, currency, presetPrice }) => {
  const { addAlert, removeAlert, getActiveAlertsForModel } = useAlertStore();
  const [targetPrice, setTargetPrice] = useState(presetPrice?.toString() || model.effectiveCostPer1M.toFixed(2));
  const [condition, setCondition] = useState<'below' | 'above'>('below');
  const [showForm, setShowForm] = useState(false);

  const modelAlerts = getActiveAlertsForModel(model.id);

  const handleAdd = () => {
    const price = parseFloat(targetPrice);
    if (!isNaN(price) && price > 0) {
      addAlert({ modelId: model.id, targetPrice: price, condition });
      setShowForm(false);
    }
  };

  return (
    <div className="surface-card p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-aura-textPrimary uppercase tracking-wider flex items-center gap-2">
          <Bell size={12} /> Price Alerts
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="p-1 rounded hover:bg-white/5 text-aura-textMuted hover:text-aura-textPrimary"
        >
          <Plus size={12} />
        </button>
      </div>

      {showForm && (
        <div className="bg-aura-base rounded border border-aura-border p-2.5 mb-3 space-y-2">
          <div>
            <label className="text-2xs text-aura-textMuted block mb-1">Target Price ({currency}/1M)</label>
            <input
              type="number"
              step="0.01"
              value={targetPrice}
              onChange={e => setTargetPrice(e.target.value)}
              className="w-full bg-aura-surface border border-aura-border rounded px-2 py-1 text-xs font-mono text-aura-textPrimary focus:outline-none focus:border-aura-textMuted"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCondition('below')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded text-2xs border transition-colors',
                condition === 'below'
                  ? 'bg-aura-green/10 text-aura-green border-aura-green/30'
                  : 'border-aura-border text-aura-textMuted hover:text-aura-textSecondary'
              )}
            >
              <TrendingDown size={10} /> Drops Below
            </button>
            <button
              onClick={() => setCondition('above')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded text-2xs border transition-colors',
                condition === 'above'
                  ? 'bg-aura-red/10 text-aura-red border-aura-red/30'
                  : 'border-aura-border text-aura-textMuted hover:text-aura-textSecondary'
              )}
            >
              <TrendingUp size={10} /> Rises Above
            </button>
          </div>
          <button
            onClick={handleAdd}
            className="w-full py-1.5 rounded bg-aura-blue text-white text-xs font-medium hover:bg-aura-blue/90 transition-colors"
          >
            Set Alert
          </button>
        </div>
      )}

      {modelAlerts.length === 0 ? (
        <div className="text-center py-3 text-2xs text-aura-textMuted">
          <Bell size={14} className="mx-auto mb-1 opacity-40" />
          No active alerts for this model
        </div>
      ) : (
        <div className="space-y-1.5">
          {modelAlerts.map(alert => (
            <div key={alert.id} className="flex items-center justify-between px-2 py-1.5 rounded bg-aura-base border border-aura-border">
              <div className="flex items-center gap-2">
                <BellRing size={10} className={alert.condition === 'below' ? 'text-aura-green' : 'text-aura-red'} />
                <span className="text-xs text-aura-textSecondary">
                  {alert.condition === 'below' ? 'Below' : 'Above'} {formatCurrency(alert.targetPrice, currency)}
                </span>
              </div>
              <button
                onClick={() => removeAlert(alert.id)}
                className="p-0.5 rounded hover:bg-white/5 text-aura-textMuted hover:text-aura-red"
              >
                <Trash2 size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
