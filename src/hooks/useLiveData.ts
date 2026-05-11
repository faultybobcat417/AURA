import { useState, useEffect, useCallback } from 'react';
import { fetchOpenRouterModels, normalizeModelPricing } from '../api/openrouter';
import { fetchArenaLeaderboard, fuzzyMatchModel } from '../api/arena';
import { models as mockModels } from '../data/mockData';
import type { Model, ArenaLeaderboardEntry, OpenRouterModel } from '../types';

interface LiveDataState {
  models: Model[];
  arenaData: ArenaLeaderboardEntry[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useLiveData(refreshInterval: number = 5 * 60 * 1000) {
  const [state, setState] = useState<LiveDataState>({
    models: mockModels,
    arenaData: [],
    loading: false,
    error: null,
    lastUpdated: null,
  });

  const fetchData = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));

    try {
      let openRouterModels: OpenRouterModel[] = [];
      try {
        openRouterModels = await fetchOpenRouterModels();
      } catch (e) {
        console.warn('OpenRouter fetch failed:', e);
      }

      let arenaData: ArenaLeaderboardEntry[] = [];
      try {
        arenaData = await fetchArenaLeaderboard();
      } catch (e) {
        console.warn('Arena fetch failed:', e);
      }

      let mergedModels = openRouterModels.length > 0
        ? normalizeModelPricing(openRouterModels, mockModels) as Model[]
        : [...mockModels];

      // Merge arena data
      if (arenaData.length > 0) {
        mergedModels = mergedModels.map(m => {
          const arenaMatch = fuzzyMatchModel(m.name, mergedModels) || arenaData.find(a =>
            a.model.toLowerCase().includes(m.name.toLowerCase()) ||
            m.name.toLowerCase().includes(a.model.toLowerCase())
          );
          if (arenaMatch) {
            return {
              ...m,
              arenaRank: arenaMatch.rank,
              arenaElo: arenaMatch.score,
              arenaCi: arenaMatch.ci,
            };
          }
          return m;
        });
      }

      setState({
        models: mergedModels,
        arenaData,
        loading: false,
        error: openRouterModels.length === 0 && arenaData.length === 0 ? 'Live data unavailable' : null,
        lastUpdated: new Date(),
      });
    } catch (e) {
      setState(s => ({
        ...s,
        loading: false,
        error: 'Failed to fetch live data',
        lastUpdated: s.lastUpdated,
      }));
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return { ...state, refetch: fetchData };
}
