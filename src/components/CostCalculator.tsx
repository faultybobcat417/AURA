import React, { useEffect } from 'react';
import { Calculator, Download } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { formatCurrency } from '../lib/utils';

export const CostCalculator: React.FC = () => {
  const {
    currency,
    simulatorConstraints,
    setSimulatorConstraint,
    simulatorResult,
    runSimulation,
  } = useAppStore();

  useEffect(() => {
    runSimulation();
  }, []);

  const handleChange = (key: keyof typeof simulatorConstraints, val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setSimulatorConstraint(key, num as any);
      setTimeout(runSimulation, 0);
    }
  };

  return (
    <div className="surface-card p-3 sticky top-0">
      <h3 className="text-xs font-semibold text-aura-textPrimary uppercase tracking-wider mb-3 flex items-center gap-2">
        <Calculator size={12} /> Cost Calculator
      </h3>

      <div className="space-y-3 mb-4">
        <div>
          <label className="text-2xs text-aura-textMuted mb-1 block">Monthly Tokens</label>
          <input
            type="number"
            value={simulatorConstraints.monthlyTokens}
            onChange={e => handleChange('monthlyTokens', e.target.value)}
            className="w-full bg-aura-base border border-aura-border rounded px-2 py-1.5 text-xs font-mono text-aura-textPrimary focus:outline-none focus:border-aura-textMuted"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-2xs text-aura-textMuted mb-1 block">Input Ratio</label>
            <input
              type="number"
              step={0.1}
              min={0}
              max={1}
              value={simulatorConstraints.inputRatio}
              onChange={e => handleChange('inputRatio', e.target.value)}
              className="w-full bg-aura-base border border-aura-border rounded px-2 py-1.5 text-xs font-mono text-aura-textPrimary focus:outline-none focus:border-aura-textMuted"
            />
          </div>
          <div>
            <label className="text-2xs text-aura-textMuted mb-1 block">Output Ratio</label>
            <input
              type="number"
              step={0.1}
              min={0}
              max={1}
              value={simulatorConstraints.outputRatio}
              onChange={e => handleChange('outputRatio', e.target.value)}
              className="w-full bg-aura-base border border-aura-border rounded px-2 py-1.5 text-xs font-mono text-aura-textPrimary focus:outline-none focus:border-aura-textMuted"
            />
          </div>
        </div>
        <div>
          <label className="text-2xs text-aura-textMuted mb-1 block">Latency SLO (ms)</label>
          <input
            type="number"
            value={simulatorConstraints.latencySLO}
            onChange={e => handleChange('latencySLO', e.target.value)}
            className="w-full bg-aura-base border border-aura-border rounded px-2 py-1.5 text-xs font-mono text-aura-textPrimary focus:outline-none focus:border-aura-textMuted"
          />
        </div>
        <div>
          <label className="text-2xs text-aura-textMuted mb-1 block">Accuracy Floor (%)</label>
          <input
            type="number"
            value={simulatorConstraints.accuracyFloor}
            onChange={e => handleChange('accuracyFloor', e.target.value)}
            className="w-full bg-aura-base border border-aura-border rounded px-2 py-1.5 text-xs font-mono text-aura-textPrimary focus:outline-none focus:border-aura-textMuted"
          />
        </div>
      </div>

      {simulatorResult && (
        <div className="border-t border-aura-border pt-3 space-y-3">
          <div>
            <div className="text-2xs text-aura-textMuted mb-1">Optimal Mix</div>
            <div className="space-y-1">
              {simulatorResult.mix.map(item => (
                <div key={item.modelId} className="flex items-center justify-between text-xs">
                  <span className="text-aura-textPrimary">{item.modelId}</span>
                  <span className="font-mono text-aura-textSecondary">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-2xs text-aura-textMuted mb-1">Savings vs Single-Provider</div>
            <div className="text-xl font-mono font-semibold text-aura-green">
              {formatCurrency(simulatorResult.savingsVsSingle, currency)}/mo
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-aura-base rounded p-2">
              <div className="text-2xs text-aura-textMuted">Est. Cost</div>
              <div className="font-mono text-aura-textPrimary">{formatCurrency(simulatorResult.estimatedCost, currency)}</div>
            </div>
            <div className="bg-aura-base rounded p-2">
              <div className="text-2xs text-aura-textMuted">Est. Latency</div>
              <div className="font-mono text-aura-textPrimary">{Math.round(simulatorResult.estimatedLatency)}ms</div>
            </div>
          </div>
        </div>
      )}

      <button className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 rounded bg-aura-surfaceHighlight border border-aura-border text-xs text-aura-textPrimary hover:bg-white/[0.05] transition-colors">
        <Download size={12} />
        Export Config
      </button>
    </div>
  );
};
