import React, { useState } from 'react';
import { SlidersHorizontal, Play, Download, ShieldAlert } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { models, providers } from '../data/mockData';
import { formatCurrency, formatLatency } from '../lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, CartesianGrid,
} from 'recharts';

export const RoutingSimulator: React.FC = () => {
  const {
    simulatorConstraints,
    setSimulatorConstraint,
    simulatorResult,
    runSimulation,
    currency,
  } = useAppStore();

  const [step, setStep] = useState(1);
  const [whatIfPriceHike, setWhatIfPriceHike] = useState(20);



  const monteCarloData = Array.from({ length: 50 }, (_, i) => ({
    run: i + 1,
    cost: simulatorResult ? simulatorResult.estimatedCost * (0.85 + Math.random() * 0.3) : 0,
    latency: simulatorResult ? simulatorResult.estimatedLatency * (0.8 + Math.random() * 0.4) : 0,
  }));

  return (
    <div className="min-h-screen pt-28 px-6 pb-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-aura-textPrimary">Routing Simulator</h1>
            <p className="text-sm text-aura-textSecondary mt-1">Find the optimal model mix for your workload</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-2xs px-2 py-1 rounded border ${step === 1 ? 'bg-aura-blue/20 border-aura-blue text-aura-blue' : 'border-aura-border text-aura-textMuted'}`}>1. Traffic</span>
            <span className={`text-2xs px-2 py-1 rounded border ${step === 2 ? 'bg-aura-blue/20 border-aura-blue text-aura-blue' : 'border-aura-border text-aura-textMuted'}`}>2. Constraints</span>
            <span className={`text-2xs px-2 py-1 rounded border ${step === 3 ? 'bg-aura-blue/20 border-aura-blue text-aura-blue' : 'border-aura-border text-aura-textMuted'}`}>3. Results</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar Controls */}
          <div className="space-y-4">
            <div className="surface-card p-4">
              <h3 className="text-xs font-semibold text-aura-textPrimary uppercase tracking-wider mb-3 flex items-center gap-2">
                <SlidersHorizontal size={12} /> Traffic Profile
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-2xs text-aura-textMuted mb-1 block">Monthly Tokens</label>
                  <input
                    type="range"
                    min="1000000"
                    max="1000000000"
                    step="1000000"
                    value={simulatorConstraints.monthlyTokens}
                    onChange={e => setSimulatorConstraint('monthlyTokens', parseInt(e.target.value))}
                    className="w-full accent-aura-blue"
                  />
                  <div className="text-xs font-mono text-aura-textPrimary mt-1">{(simulatorConstraints.monthlyTokens / 1e6).toFixed(0)}M</div>
                </div>
                <div>
                  <label className="text-2xs text-aura-textMuted mb-1 block">Input/Output Split</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={simulatorConstraints.inputRatio}
                      onChange={e => {
                        const val = parseFloat(e.target.value);
                        setSimulatorConstraint('inputRatio', val);
                        setSimulatorConstraint('outputRatio', 1 - val);
                      }}
                      className="flex-1 accent-aura-blue"
                    />
                  </div>
                  <div className="text-xs font-mono text-aura-textPrimary mt-1">
                    {(simulatorConstraints.inputRatio * 100).toFixed(0)}% / {(simulatorConstraints.outputRatio * 100).toFixed(0)}%
                  </div>
                </div>
                <div>
                  <label className="text-2xs text-aura-textMuted mb-1 block">Peak Concurrency</label>
                  <input
                    type="number"
                    value={simulatorConstraints.peakConcurrency}
                    onChange={e => setSimulatorConstraint('peakConcurrency', parseInt(e.target.value))}
                    className="w-full bg-aura-base border border-aura-border rounded px-2 py-1.5 text-xs font-mono text-aura-textPrimary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="surface-card p-4">
              <h3 className="text-xs font-semibold text-aura-textPrimary uppercase tracking-wider mb-3 flex items-center gap-2">
                <ShieldAlert size={12} /> Constraints
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-2xs text-aura-textMuted mb-1 block">Latency SLO (ms)</label>
                  <input
                    type="number"
                    value={simulatorConstraints.latencySLO}
                    onChange={e => setSimulatorConstraint('latencySLO', parseInt(e.target.value))}
                    className="w-full bg-aura-base border border-aura-border rounded px-2 py-1.5 text-xs font-mono text-aura-textPrimary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-2xs text-aura-textMuted mb-1 block">Accuracy Floor (%)</label>
                  <input
                    type="number"
                    value={simulatorConstraints.accuracyFloor}
                    onChange={e => setSimulatorConstraint('accuracyFloor', parseFloat(e.target.value))}
                    className="w-full bg-aura-base border border-aura-border rounded px-2 py-1.5 text-xs font-mono text-aura-textPrimary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-2xs text-aura-textMuted mb-1 block">Budget Ceiling</label>
                  <input
                    type="number"
                    value={simulatorConstraints.budgetCeiling}
                    onChange={e => setSimulatorConstraint('budgetCeiling', parseFloat(e.target.value))}
                    className="w-full bg-aura-base border border-aura-border rounded px-2 py-1.5 text-xs font-mono text-aura-textPrimary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-2xs text-aura-textMuted mb-1 block">Blacklist Providers</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {providers.map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          const current = simulatorConstraints.blacklistedProviders;
                          const updated = current.includes(p.id) ? current.filter(id => id !== p.id) : [...current, p.id];
                          setSimulatorConstraint('blacklistedProviders', updated);
                        }}
                        className={`px-2 py-0.5 rounded text-2xs border transition-colors ${simulatorConstraints.blacklistedProviders.includes(p.id) ? 'bg-aura-red/20 border-aura-red text-aura-red' : 'bg-transparent border-aura-border text-aura-textMuted hover:text-aura-textSecondary'}`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => { runSimulation(); setStep(3); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-aura-blue text-white text-sm font-medium hover:bg-aura-blue/90 transition-colors"
            >
              <Play size={14} /> Run Simulation
            </button>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-4">
            {simulatorResult && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="surface-card p-3">
                    <div className="text-2xs text-aura-textMuted mb-1">Est. Monthly Cost</div>
                    <div className="text-lg font-mono font-semibold text-aura-textPrimary">{formatCurrency(simulatorResult.estimatedCost, currency)}</div>
                  </div>
                  <div className="surface-card p-3">
                    <div className="text-2xs text-aura-textMuted mb-1">Est. P50 Latency</div>
                    <div className="text-lg font-mono font-semibold text-aura-textPrimary">{formatLatency(simulatorResult.estimatedLatency)}</div>
                  </div>
                  <div className="surface-card p-3">
                    <div className="text-2xs text-aura-textMuted mb-1">Failure Probability</div>
                    <div className="text-lg font-mono font-semibold text-aura-amber">{(simulatorResult.failureProbability * 100).toFixed(1)}%</div>
                  </div>
                  <div className="surface-card p-3">
                    <div className="text-2xs text-aura-textMuted mb-1">Savings vs Single</div>
                    <div className="text-lg font-mono font-semibold text-aura-green">{formatCurrency(simulatorResult.savingsVsSingle, currency)}</div>
                  </div>
                </div>

                <div className="surface-card p-4">
                  <h3 className="text-xs font-semibold text-aura-textPrimary mb-3">Optimal Mix</h3>
                  <div className="space-y-2 mb-4">
                    {simulatorResult.mix.map(item => {
                      const model = models.find(m => m.id === item.modelId);
                      return (
                        <div key={item.modelId} className="flex items-center gap-3">
                          <div className="w-24 text-xs text-aura-textPrimary">{model?.name}</div>
                          <div className="flex-1 h-4 bg-aura-base rounded-full overflow-hidden">
                            <div
                              className="h-full bg-aura-blue rounded-full"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                          <div className="w-10 text-xs font-mono text-aura-textSecondary text-right">{item.percentage}%</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-2xs text-aura-textMuted mb-2">Monte Carlo Cost Distribution</h4>
                      <ResponsiveContainer width="100%" height={150}>
                        <BarChart data={monteCarloData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="run" hide />
                          <YAxis tick={{ fill: '#5A6275', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                          <Tooltip contentStyle={{ background: '#1A1D29', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', fontSize: '12px' }} formatter={(value) => formatCurrency(Number(value), currency)} />
                          <Bar dataKey="cost" fill="#2979FF" fillOpacity={0.6} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <h4 className="text-2xs text-aura-textMuted mb-2">Cost vs Latency Tradeoff</h4>
                      <ResponsiveContainer width="100%" height={150}>
                        <ScatterChart>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis type="number" dataKey="cost" name="Cost" tick={{ fill: '#5A6275', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                          <YAxis type="number" dataKey="latency" name="Latency" tick={{ fill: '#5A6275', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `${v.toFixed(0)}ms`} />
                          <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: '#1A1D29', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', fontSize: '12px' }} />
                          <Scatter data={monteCarloData} fill="#00C853" fillOpacity={0.6} />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="surface-card p-4">
                  <h3 className="text-xs font-semibold text-aura-textPrimary mb-3">What If Scenarios</h3>
                  <div className="mb-3">
                    <label className="text-2xs text-aura-textMuted">Groq raises prices by {whatIfPriceHike}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={whatIfPriceHike}
                      onChange={e => setWhatIfPriceHike(parseInt(e.target.value))}
                      className="w-full accent-aura-amber mt-1"
                    />
                  </div>
                  <div className="bg-aura-base rounded p-3 border border-aura-border">
                    <div className="text-xs text-aura-textSecondary">
                      If Groq raises prices by <span className="text-aura-amber font-mono">{whatIfPriceHike}%</span>,
                      the optimal mix shifts to favor <span className="text-aura-blue">Together AI</span> and <span className="text-aura-blue">Fireworks</span> for Llama-based inference.
                      Estimated cost increase: <span className="text-aura-red font-mono">{formatCurrency(simulatorResult.estimatedCost * (whatIfPriceHike / 100) * 0.15, currency)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 rounded bg-aura-surfaceHighlight border border-aura-border text-xs text-aura-textPrimary hover:bg-white/[0.05]">
                    <Download size={12} /> Export Terraform
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded bg-aura-surfaceHighlight border border-aura-border text-xs text-aura-textPrimary hover:bg-white/[0.05]">
                    <Download size={12} /> Export K8s ConfigMap
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded bg-aura-surfaceHighlight border border-aura-border text-xs text-aura-textPrimary hover:bg-white/[0.05]">
                    <Download size={12} /> Export JSON
                  </button>
                </div>
              </>
            )}

            {!simulatorResult && (
              <div className="surface-card p-12 text-center">
                <SlidersHorizontal size={32} className="mx-auto mb-3 text-aura-textMuted opacity-40" />
                <div className="text-sm text-aura-textSecondary">Configure your traffic profile and constraints, then run the simulation.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
