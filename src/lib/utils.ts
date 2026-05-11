import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency: string = 'USD', compact: boolean = false): string {
  if (!isFinite(value)) return 'Free';
  const fmt = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: value < 1 ? 4 : 2,
    maximumFractionDigits: value < 1 ? 4 : 2,
    notation: compact && value >= 1000 ? 'compact' : 'standard',
  });
  return fmt.format(value);
}

export function formatNumber(value: number, decimals: number = 1): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatLatency(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function formatPercent(value: number, signed: boolean = false): string {
  const prefix = signed && value > 0 ? '+' : signed && value < 0 ? '' : '';
  return `${prefix}${value.toFixed(1)}%`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function getLatencyColor(ms: number): string {
  if (ms < 100) return 'text-aura-green';
  if (ms < 500) return 'text-aura-amber';
  return 'text-aura-red';
}

export function getLatencyBg(ms: number): string {
  if (ms < 100) return 'bg-aura-green';
  if (ms < 500) return 'bg-aura-amber';
  return 'bg-aura-red';
}

export function getChangeColor(change: number): string {
  if (change < 0) return 'text-aura-green';
  if (change > 0) return 'text-aura-red';
  return 'text-aura-textSecondary';
}

export function getStatusColor(status: string): string {
  if (status === 'operational') return 'status-dot-green';
  if (status === 'degraded') return 'status-dot-amber';
  return 'status-dot-red';
}

export function getStatusTextColor(status: string): string {
  if (status === 'operational') return 'text-aura-green';
  if (status === 'degraded') return 'text-aura-amber';
  return 'text-aura-red';
}

export function convertCurrency(amount: number, from: string, to: string): number {
  const rates: Record<string, number> = { USD: 1, CAD: 1.43, EUR: 0.92, GBP: 0.79 };
  const usd = amount / rates[from];
  return usd * rates[to];
}

export function calculateUEM(accuracy: number, reliability: number, cost: number, latency: number): number {
  const normalizedCost = cost;
  const normalizedLatency = latency / 1000;
  if (normalizedCost === 0 || normalizedLatency === 0) return 999;
  return (accuracy * (reliability / 100)) / (normalizedCost * normalizedLatency);
}
