import type { OpenRouterModel } from '../types';

const OPENROUTER_API = 'https://openrouter.ai/api/v1/models';
const FALLBACK_PROXY = 'https://api.allorigins.win/raw?url=';

export async function fetchOpenRouterModels(): Promise<OpenRouterModel[]> {
  try {
    const res = await fetch(OPENROUTER_API, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.data.map((m: any) => ({
      id: m.id,
      name: m.name,
      description: m.description || '',
      pricing: {
        prompt: parseFloat(m.pricing?.prompt || 0) * 1_000_000,
        completion: parseFloat(m.pricing?.completion || 0) * 1_000_000,
      },
      context_length: m.context_length || 0,
    }));
  } catch (err) {
    try {
      const res = await fetch(`${FALLBACK_PROXY}${encodeURIComponent(OPENROUTER_API)}`);
      if (!res.ok) throw new Error(`Proxy HTTP ${res.status}`);
      const data = await res.json();
      return data.data.map((m: any) => ({
        id: m.id,
        name: m.name,
        description: m.description || '',
        pricing: {
          prompt: parseFloat(m.pricing?.prompt || 0) * 1_000_000,
          completion: parseFloat(m.pricing?.completion || 0) * 1_000_000,
        },
        context_length: m.context_length || 0,
      }));
    } catch {
      throw err;
    }
  }
}

export function normalizeModelPricing(
  openRouterModels: OpenRouterModel[],
  localModels: any[]
): any[] {
  return localModels.map(local => {
    const match = openRouterModels.find(
      or =>
        or.id === local.id ||
        or.id.includes(local.id) ||
        local.id.includes(or.id) ||
        or.name.toLowerCase().includes(local.name.toLowerCase())
    );

    if (match) {
      return {
        ...local,
        costPer1MInput: match.pricing.prompt,
        costPer1MOutput: match.pricing.completion,
        effectiveCostPer1M: (match.pricing.prompt + match.pricing.completion * 2) / 3,
        contextWindow: match.context_length || local.contextWindow,
        description: match.description || local.description,
      };
    }
    return local;
  });
}
