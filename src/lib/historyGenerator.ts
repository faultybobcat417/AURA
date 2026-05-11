import type { OHLCPoint } from '../types';

export function generateOHLCHistory(
  basePrice: number,
  days: number = 90,
  volatility: number = 0.03
): OHLCPoint[] {
  const history: OHLCPoint[] = [];
  let price = basePrice * (1 + (Math.random() - 0.5) * volatility * 4);
  const now = Date.now();

  for (let i = days; i >= 0; i--) {
    const dailyChange = (Math.random() - 0.48) * volatility;
    const open = price;
    const close = price * (1 + dailyChange);
    const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
    const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5);
    const volume = Math.round(1000 + Math.random() * 9000);

    const time = Math.floor((now - i * 86400000) / 1000);

    history.push({
      time,
      open: Math.max(0.001, parseFloat(open.toFixed(6))),
      high: Math.max(0.001, parseFloat(high.toFixed(6))),
      low: Math.max(0.001, parseFloat(low.toFixed(6))),
      close: Math.max(0.001, parseFloat(close.toFixed(6))),
      volume,
    });

    price = close;
  }

  return history;
}

export function getStatsFromHistory(history: OHLCPoint[]) {
  if (!history.length) return null;

  const closes = history.map(h => h.close);
  const highs = history.map(h => h.high);
  const lows = history.map(h => h.low);
  const volumes = history.map(h => h.volume);

  const current = closes[closes.length - 1];
  const previous = closes[closes.length - 2] ?? current;
  const change24h = ((current - previous) / previous) * 100;

  const day24High = Math.max(...highs.slice(-1));
  const day24Low = Math.min(...lows.slice(-1));
  const avg30d = closes.slice(-30).reduce((a, b) => a + b, 0) / Math.min(30, closes.length);
  const allTimeHigh = Math.max(...highs);
  const allTimeLow = Math.min(...lows);
  const avgVolume = Math.round(volumes.reduce((a, b) => a + b, 0) / volumes.length);

  return {
    current,
    change24h,
    day24High,
    day24Low,
    avg30d,
    allTimeHigh,
    allTimeLow,
    avgVolume,
  };
}

export function aggregateToTimeFrame(
  data: OHLCPoint[],
  timeFrame: string
): OHLCPoint[] {
  if (timeFrame === '1D' || data.length <= 90) return data;

  const groupSize =
    timeFrame === '1W' ? 7 :
    timeFrame === '1M' ? 30 :
    timeFrame === '3M' ? 90 :
    timeFrame === '1Y' ? 365 : 1;

  const aggregated: OHLCPoint[] = [];
  for (let i = 0; i < data.length; i += groupSize) {
    const group = data.slice(i, i + groupSize);
    if (!group.length) continue;
    aggregated.push({
      time: group[0].time,
      open: group[0].open,
      high: Math.max(...group.map(g => g.high)),
      low: Math.min(...group.map(g => g.low)),
      close: group[group.length - 1].close,
      volume: group.reduce((s, g) => s + g.volume, 0),
    });
  }

  return aggregated;
}
