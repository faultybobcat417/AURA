import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Currency, Modality, UseCase, WatchlistItem, SimulatorConstraints, SimulatorResult, Model } from '../types';
import { models as mockModels } from '../data/mockData';


interface AppState {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  selectedModelId: string | null;
  setSelectedModelId: (id: string | null) => void;
  watchlist: WatchlistItem[];
  toggleWatchlist: (modelId: string) => void;
  isInWatchlist: (modelId: string) => boolean;
  filters: {
    modalities: Modality[];
    useCases: UseCase[];
    providers: string[];
  };
  setFilter: (key: 'modalities' | 'useCases' | 'providers', values: string[]) => void;
  clearFilters: () => void;
  simulatorConstraints: SimulatorConstraints;
  setSimulatorConstraint: <K extends keyof SimulatorConstraints>(key: K, value: SimulatorConstraints[K]) => void;
  simulatorResult: SimulatorResult | null;
  runSimulation: () => void;
  compareModelIds: string[];
  toggleCompare: (modelId: string) => void;
  lastUpdated: Date;
  refreshData: (refetch?: () => void) => void;
  liveModels: Model[];
  liveLoading: boolean;
  liveError: string | null;
  setLiveModels: (models: Model[]) => void;
  setLiveLoading: (loading: boolean) => void;
  setLiveError: (error: string | null) => void;
}

const defaultConstraints: SimulatorConstraints = {
  monthlyTokens: 100000000,
  inputRatio: 0.7,
  outputRatio: 0.3,
  peakConcurrency: 100,
  latencySLO: 300,
  accuracyFloor: 80,
  budgetCeiling: 50000,
  blacklistedProviders: [],
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currency: 'USD',
      setCurrency: (c) => set({ currency: c }),
      searchOpen: false,
      setSearchOpen: (v) => set({ searchOpen: v }),
      selectedModelId: null,
      setSelectedModelId: (id) => set({ selectedModelId: id }),
      watchlist: [],
      toggleWatchlist: (modelId) => {
        const current = get().watchlist;
        const exists = current.find(w => w.modelId === modelId);
        if (exists) {
          set({ watchlist: current.filter(w => w.modelId !== modelId) });
        } else {
          set({ watchlist: [...current, { modelId, addedAt: new Date().toISOString() }] });
        }
      },
      isInWatchlist: (modelId) => get().watchlist.some(w => w.modelId === modelId),
      filters: { modalities: [], useCases: [], providers: [] },
      setFilter: (key, values) => set(state => ({
        filters: { ...state.filters, [key]: values }
      })),
      clearFilters: () => set({ filters: { modalities: [], useCases: [], providers: [] } }),
      simulatorConstraints: defaultConstraints,
      setSimulatorConstraint: (key, value) => set(state => ({
        simulatorConstraints: { ...state.simulatorConstraints, [key]: value }
      })),
      simulatorResult: null,
      runSimulation: () => {
        const constraints = get().simulatorConstraints;
        const eligible = get().liveModels.filter(m => {
          if (constraints.blacklistedProviders.includes(m.providerId)) return false;
          if (m.latencyP50 > constraints.latencySLO) return false;
          if (m.benchmarkScore < constraints.accuracyFloor) return false;
          return true;
        }).sort((a, b) => b.uem - a.uem);

        if (eligible.length === 0) {
          set({ simulatorResult: null });
          return;
        }

        const top = eligible.slice(0, 3);
        const totalUem = top.reduce((s, m) => s + m.uem, 0);
        const mix = top.map(m => ({
          modelId: m.id,
          percentage: Math.round((m.uem / totalUem) * 100),
        }));

        const inputTokens = constraints.monthlyTokens * constraints.inputRatio;
        const outputTokens = constraints.monthlyTokens * constraints.outputRatio;
        const estimatedCost = mix.reduce((sum, item) => {
          const model = get().liveModels.find(m => m.id === item.modelId)!;
          const share = item.percentage / 100;
          return sum + (inputTokens / 1000000 * model.costPer1MInput * share) + (outputTokens / 1000000 * model.costPer1MOutput * share);
        }, 0);

        const estimatedLatency = mix.reduce((sum, item) => {
          const model = get().liveModels.find(m => m.id === item.modelId)!;
          return sum + model.latencyP50 * (item.percentage / 100);
        }, 0);

        const bestSingle = eligible[0];
        const singleCost = (inputTokens / 1000000 * bestSingle.costPer1MInput) + (outputTokens / 1000000 * bestSingle.costPer1MOutput);
        const savingsVsSingle = singleCost - estimatedCost;

        set({
          simulatorResult: {
            mix,
            estimatedCost,
            estimatedLatency,
            failureProbability: 0.02 + (mix.length > 1 ? -0.01 : 0),
            savingsVsSingle: Math.max(0, savingsVsSingle),
          }
        });
      },
      compareModelIds: [],
      toggleCompare: (modelId) => {
        const current = get().compareModelIds;
        if (current.includes(modelId)) {
          set({ compareModelIds: current.filter(id => id !== modelId) });
        } else if (current.length < 4) {
          set({ compareModelIds: [...current, modelId] });
        }
      },
      lastUpdated: new Date(),
      refreshData: (refetch) => {
        if (refetch) refetch();
        set({ lastUpdated: new Date() });
      },
      liveModels: mockModels,
      liveLoading: false,
      liveError: null,
      setLiveModels: (models) => set({ liveModels: models }),
      setLiveLoading: (loading) => set({ liveLoading: loading }),
      setLiveError: (error) => set({ liveError: error }),
    }),
    {
      name: 'aura-storage',
      partialize: (state) => ({ currency: state.currency, watchlist: state.watchlist }),
    }
  )
);
