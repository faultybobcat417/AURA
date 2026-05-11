export type Currency = 'USD' | 'CAD' | 'EUR' | 'GBP';
export type Modality = 'Text' | 'Vision' | 'Audio' | 'Multimodal';
export type UseCase = 'Coding' | 'Reasoning' | 'Creative' | 'Enterprise' | 'General';
export type ProviderStatus = 'operational' | 'degraded' | 'outage';
export type AlertType = 'price_drop' | 'price_spike' | 'latency_spike' | 'new_model' | 'outage';
export type PriceAlertCondition = 'below' | 'above';
export type TimeFrame = '1H' | '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';

export interface Provider {
  id: string;
  name: string;
  logoUrl?: string;
  status: ProviderStatus;
  uptime24h: number;
  uptime7d: number;
  uptime30d: number;
  latencyTrend: 'up' | 'down' | 'flat';
  regions: RegionLatency[];
  compliance: string[];
  docsUrl: string;
}

export interface RegionLatency {
  region: string;
  p50: number;
  p90: number;
  p99: number;
  status: ProviderStatus;
}

export interface OHLCPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Model {
  id: string;
  name: string;
  providerId: string;
  providerName: string;
  modality: Modality;
  useCases: UseCase[];
  costPer1MInput: number;
  costPer1MOutput: number;
  cachingDiscount?: number;
  batchDiscount?: number;
  effectiveCostPer1M: number;
  latencyP50: number;
  latencyP90: number;
  latencyP99: number;
  ttft: number;
  tps: number;
  benchmarkScore: number;
  uem: number;
  change24h: number;
  sparkline: number[];
  status: ProviderStatus;
  description: string;
  releaseDate: string;
  contextWindow: number;
  benchmarks: Record<string, number>;
  history90d: OHLCPoint[];
  arenaRank?: number;
  arenaElo?: number;
  arenaCi?: number;
}

export interface MarketMover {
  modelId: string;
  modelName: string;
  providerName: string;
  change: number;
  type: 'gainer' | 'loser' | 'new';
}

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  timestamp: string;
  modelId?: string;
  providerId?: string;
}

export interface PriceAlert {
  id: string;
  modelId: string;
  targetPrice: number;
  condition: PriceAlertCondition;
  createdAt: string;
  triggered: boolean;
  triggeredAt?: string;
}

export interface WatchlistItem {
  modelId: string;
  addedAt: string;
}

export interface SimulatorConstraints {
  monthlyTokens: number;
  inputRatio: number;
  outputRatio: number;
  peakConcurrency: number;
  latencySLO: number;
  accuracyFloor: number;
  budgetCeiling: number;
  blacklistedProviders: string[];
}

export interface SimulatorResult {
  mix: { modelId: string; percentage: number }[];
  estimatedCost: number;
  estimatedLatency: number;
  failureProbability: number;
  savingsVsSingle: number;
}

export interface Benchmark {
  id: string;
  name: string;
  description: string;
  contaminationRisk: 'low' | 'medium' | 'high';
  lastUpdated: string;
  topModels: { modelId: string; modelName: string; score: number }[];
}

export interface UptimeRecord {
  providerId: string;
  date: string;
  uptime: number;
}

export interface ArenaLeaderboardEntry {
  rank: number;
  model: string;
  vendor: string;
  score: number;
  ci: number;
  votes: number;
}

export interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  pricing: {
    prompt: number;
    completion: number;
  };
  context_length: number;
}

export interface ActivityItem {
  id: string;
  type: 'price_change' | 'latency_spike' | 'benchmark_update' | 'provider_status';
  title: string;
  description: string;
  timestamp: string;
  modelId?: string;
  providerId?: string;
  value?: number;
}
