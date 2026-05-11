import type { ArenaLeaderboardEntry } from '../types';

const ARENA_API = 'https://api.wulong.dev/arena-ai-leaderboards/v1/leaderboard?name=text';
const ARENA_FALLBACK = 'https://raw.githubusercontent.com/oolong-tea-2026/arena-ai-leaderboards/main/data/latest.json';

export async function fetchArenaLeaderboard(): Promise<ArenaLeaderboardEntry[]> {
  try {
    const res = await fetch(ARENA_API);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.map((e: any) => ({
      rank: e.rank,
      model: e.model,
      vendor: e.vendor,
      score: e.score,
      ci: e.ci,
      votes: e.votes,
    }));
  } catch {
    try {
      const res = await fetch(ARENA_FALLBACK);
      if (!res.ok) throw new Error(`Fallback HTTP ${res.status}`);
      const data = await res.json();
      return data.map((e: any) => ({
        rank: e.rank,
        model: e.model,
        vendor: e.vendor,
        score: e.score,
        ci: e.ci,
        votes: e.votes,
      }));
    } catch {
      return [];
    }
  }
}

export function fuzzyMatchModel(
  arenaName: string,
  localModels: any[]
): any | undefined {
  const normalized = arenaName.toLowerCase().replace(/[-_\s]/g, '');
  return localModels.find(m => {
    const localNorm = m.name.toLowerCase().replace(/[-_\s]/g, '');
    return (
      localNorm === normalized ||
      localNorm.includes(normalized) ||
      normalized.includes(localNorm) ||
      m.providerName.toLowerCase().includes(arenaName.toLowerCase().split(' ')[0])
    );
  });
}
