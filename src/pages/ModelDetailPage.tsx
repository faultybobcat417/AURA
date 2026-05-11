import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Globe, AlertTriangle, CheckCircle } from 'lucide-react';
import { providers } from '../data/mockData';
import { useAppStore } from '../store/useAppStore';
import { useAlertStore } from '../store/alertStore';
import { PriceChart } from '../components/PriceChart';
import { StatsGrid } from '../components/StatsGrid';
import { AlertWidget } from '../components/AlertWidget';
import { RelatedModels } from '../components/RelatedModels';
import { ActivityFeed } from '../components/ActivityFeed';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { DataBanner } from '../components/DataBanner';
import { useLiveData } from '../hooks/useLiveData';
import { getStatsFromHistory } from '../lib/historyGenerator';
import { formatCurrency, formatPercent, getStatusColor, getStatusTextColor, cn } from '../lib/utils';

export const ModelDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currency, toggleWatchlist, isInWatchlist } = useAppStore();
  const { checkAlerts } = useAlertStore();
  const [loading, setLoading] = useState(true);
  const [presetAlertPrice, setPresetAlertPrice] = useState<number | null>(null);
  const { models: liveModels, error, refetch } = useLiveData();

  const model = useMemo(() => liveModels.find(m => m.id === id), [liveModels, id]);
  const provider = useMemo(() => providers.find(p => p.id === model?.providerId), [model]);

  useEffect(() => {
    // Simulate loading for smooth transition
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [id]);

  useEffect(() => {
    if (model) {
      checkAlerts(model.id, model.effectiveCostPer1M, model.latencyP50, provider?.uptime24h || 99);
    }
  }, [model, provider, checkAlerts]);

  // Handle keyboard shortcut
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navigate('/');
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [navigate]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!model || !provider) {
    return (
      <div className="min-h-screen pt-28 px-6 pb-12 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle size={32} className="mx-auto mb-3 text-aura-amber" />
          <h1 className="text-lg font-semibold text-aura-textPrimary mb-2">Model Not Found</h1>
          <p className="text-sm text-aura-textSecondary mb-4">The model &quot;{id}&quot; does not exist in our database.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-aura-blue text-white text-sm font-medium hover:bg-aura-blue/90 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const stats = getStatsFromHistory(model.history90d);

  return (
    <div className="min-h-screen pt-28 px-4 pb-12 transition-opacity duration-200">
      <div className="max-w-6xl mx-auto space-y-4">
        {error && <DataBanner source="OpenRouter + Arena" onRetry={refetch} />}
        {/* Back button */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-aura-textMuted hover:text-aura-textPrimary transition-colors"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
        </div>

        {/* Hero header */}
        <div className="mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-aura-textPrimary">{model.name}</h1>
                <span className={`text-2xs px-2 py-0.5 rounded-full border ${getStatusTextColor(model.status)} border-current capitalize`}>
                  {model.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-aura-textSecondary flex-wrap">
                <span>{model.providerName}</span>
                <span className="text-aura-border">·</span>
                <span>{model.modality}</span>
                <span className="text-aura-border">·</span>
                <span>{(model.contextWindow / 1000).toFixed(0)}K context</span>
                <span className="text-aura-border">·</span>
                <span>Released {model.releaseDate}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleWatchlist(model.id)}
                className={cn(
                  'px-3 py-1.5 rounded border text-xs font-medium transition-colors',
                  isInWatchlist(model.id)
                    ? 'border-aura-amber text-aura-amber bg-aura-amber/10'
                    : 'border-aura-border text-aura-textSecondary hover:text-aura-textPrimary'
                )}
              >
                {isInWatchlist(model.id) ? 'In Watchlist' : 'Add to Watchlist'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT COLUMN - 60% */}
          <div className="lg:col-span-3 space-y-6">
            {/* Price Chart */}
            <div className="surface-card p-4">
              <PriceChart
                history={model.history90d}
                currency={currency}
                modelName={model.name}
                onSetAlert={price => setPresetAlertPrice(price)}
              />
            </div>

            {/* Stats Grid */}
            <div className="surface-card p-4">
              <h3 className="text-xs font-semibold text-aura-textPrimary uppercase tracking-wider mb-3">Key Metrics</h3>
              <StatsGrid model={model} provider={provider} currency={currency} />
            </div>

            {/* Benchmark Radar */}
            <div className="surface-card p-4">
              <h3 className="text-xs font-semibold text-aura-textPrimary uppercase tracking-wider mb-3">Benchmark Scores</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(model.benchmarks).map(([name, score]) => (
                  <div key={name} className="bg-aura-base rounded border border-aura-border p-2.5">
                    <div className="text-2xs text-aura-textMuted mb-1">{name}</div>
                    <div className="text-sm font-mono font-semibold text-aura-textPrimary">{score.toFixed(1)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="surface-card p-4">
              <h3 className="text-xs font-semibold text-aura-textPrimary uppercase tracking-wider mb-2">About</h3>
              <p className="text-sm text-aura-textSecondary leading-relaxed">{model.description}</p>
            </div>
          </div>

          {/* RIGHT COLUMN - 40% sticky */}
          <div className="lg:col-span-2 space-y-4 lg:sticky lg:top-28 lg:self-start">
            {/* Market Status */}
            <div className="surface-card p-4">
              <h3 className="text-xs font-semibold text-aura-textPrimary uppercase tracking-wider mb-3">Market Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-aura-textSecondary">Current Price</span>
                  <span className="text-lg font-mono font-semibold text-aura-textPrimary">
                    {formatCurrency(model.effectiveCostPer1M, currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-aura-textSecondary">24h Change</span>
                  <span className={`text-sm font-mono font-semibold ${model.change24h < 0 ? 'text-aura-green' : model.change24h > 0 ? 'text-aura-red' : 'text-aura-textSecondary'}`}>
                    {formatPercent(model.change24h, true)}
                  </span>
                </div>
                {stats && (
                  <>
                    <div className="h-px bg-aura-border" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-aura-textSecondary">24h Low</span>
                      <span className="text-sm font-mono text-aura-textPrimary">{formatCurrency(stats.day24Low, currency)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-aura-textSecondary">24h High</span>
                      <span className="text-sm font-mono text-aura-textPrimary">{formatCurrency(stats.day24High, currency)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-aura-textSecondary">All-Time High</span>
                      <span className="text-sm font-mono text-aura-green">{formatCurrency(stats.allTimeHigh, currency)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-aura-textSecondary">All-Time Low</span>
                      <span className="text-sm font-mono text-aura-red">{formatCurrency(stats.allTimeLow, currency)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Alert Widget */}
            <AlertWidget model={model} currency={currency} presetPrice={presetAlertPrice} />

            {/* Related Models */}
            <RelatedModels currentModel={model} />

            {/* Activity Feed */}
            <ActivityFeed modelId={model.id} modelName={model.name} currency={currency} />

            {/* Provider Info */}
            <div className="surface-card p-4">
              <h3 className="text-xs font-semibold text-aura-textPrimary uppercase tracking-wider mb-3">Provider Info</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(provider.status)}`} />
                  <span className="text-sm font-medium text-aura-textPrimary">{provider.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-aura-textSecondary">
                  <Globe size={12} />
                  <span>{provider.regions.length} regions</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {provider.compliance.map(c => (
                    <span key={c} className="flex items-center gap-1 text-2xs px-1.5 py-0.5 rounded bg-aura-green/10 text-aura-green border border-aura-green/20">
                      <CheckCircle size={8} /> {c}
                    </span>
                  ))}
                </div>
                <a
                  href={provider.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-aura-blue hover:text-aura-blue/80 transition-colors"
                >
                  <ExternalLink size={10} /> Provider Documentation
                </a>
                <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded border border-aura-border text-xs text-aura-textSecondary hover:text-aura-textPrimary hover:border-aura-textMuted transition-colors">
                  <AlertTriangle size={10} /> Report Issue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
