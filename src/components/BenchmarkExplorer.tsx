import React from 'react';
import { Trophy, Calendar, Upload } from 'lucide-react';
import { benchmarks } from '../data/mockData';
import { formatDate, formatNumber } from '../lib/utils';
import { useAppStore } from '../store/useAppStore';

const riskColors = {
  low: 'text-aura-green bg-aura-green/10',
  medium: 'text-aura-amber bg-aura-amber/10',
  high: 'text-aura-red bg-aura-red/10',
};

export const BenchmarkExplorer: React.FC = () => {
  const { setSelectedModelId } = useAppStore();

  return (
    <div className="min-h-screen pt-28 px-6 pb-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-aura-textPrimary">Benchmark Explorer</h1>
            <p className="text-sm text-aura-textSecondary mt-1">Understand how models are evaluated — and evaluate them yourself</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded bg-aura-blue text-white text-xs font-medium hover:bg-aura-blue/90 transition-colors">
            <Upload size={12} /> Run Your Own
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {benchmarks.map(bm => (
            <div key={bm.id} className="surface-card p-4 hover:border-aura-textMuted/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-semibold text-aura-textPrimary">{bm.name}</h3>
                <span className={`text-2xs px-1.5 py-0.5 rounded ${riskColors[bm.contaminationRisk]}`}>
                  {bm.contaminationRisk} risk
                </span>
              </div>
              <p className="text-xs text-aura-textSecondary mb-4 leading-relaxed">{bm.description}</p>
              <div className="flex items-center gap-1 text-2xs text-aura-textMuted mb-3">
                <Calendar size={10} /> Last updated {formatDate(bm.lastUpdated)}
              </div>

              <div className="bg-aura-base rounded border border-aura-border p-2">
                <div className="text-2xs text-aura-textMuted mb-2 flex items-center gap-1">
                  <Trophy size={10} /> Top Models
                </div>
                <div className="space-y-1.5">
                  {bm.topModels.map((tm, i) => (
                    <button
                      key={tm.modelId}
                      onClick={() => setSelectedModelId(tm.modelId)}
                      className="w-full flex items-center justify-between px-2 py-1 rounded hover:bg-white/[0.03]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xs font-mono text-aura-textMuted w-4">{i + 1}</span>
                        <span className="text-xs text-aura-textPrimary">{tm.modelName}</span>
                      </div>
                      <span className="text-xs font-mono text-aura-blue">{formatNumber(tm.score)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 surface-card p-6">
          <h3 className="text-sm font-semibold text-aura-textPrimary mb-3 flex items-center gap-2">
            <Upload size={14} /> Submit Your Own Results
          </h3>
          <p className="text-xs text-aura-textSecondary mb-4">
            AURA accepts community-submitted benchmark results. Submissions undergo automated verification
            and peer review before being included in the public dataset.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-aura-base rounded p-3 border border-aura-border">
              <div className="text-2xs text-aura-textMuted mb-1">Step 1</div>
              <div className="text-xs text-aura-textPrimary font-medium">Run Evaluation</div>
              <div className="text-2xs text-aura-textSecondary mt-1">Use standardized eval harness on your model</div>
            </div>
            <div className="bg-aura-base rounded p-3 border border-aura-border">
              <div className="text-2xs text-aura-textMuted mb-1">Step 2</div>
              <div className="text-xs text-aura-textPrimary font-medium">Upload Results</div>
              <div className="text-2xs text-aura-textSecondary mt-1">JSON format with full run metadata</div>
            </div>
            <div className="bg-aura-base rounded p-3 border border-aura-border">
              <div className="text-2xs text-aura-textMuted mb-1">Step 3</div>
              <div className="text-xs text-aura-textPrimary font-medium">Community Verification</div>
              <div className="text-2xs text-aura-textSecondary mt-1">72-hour review window before merge</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
