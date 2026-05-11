import { useEffect, useCallback, useState } from 'react';
import { Search, ExternalLink, Bell } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useAlertStore } from '../store/alertStore';
import { getStatusTextColor } from '../lib/utils';
import { providers } from '../data/mockData';

const currencies = ['USD', 'CAD', 'EUR', 'GBP'] as const;

export const Header: React.FC = () => {
  const { currency, setCurrency, searchOpen, setSearchOpen, liveLoading, liveError, lastUpdated } = useAppStore();
  const { getTriggeredCount } = useAlertStore();
  const triggeredCount = getTriggeredCount();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const overallStatus = providers.some(p => p.status === 'outage') ? 'outage' :
    providers.some(p => p.status === 'degraded') ? 'degraded' : 'operational';

  const minutesAgo = Math.round((now - lastUpdated.getTime()) / 60000);

  let dotClass = '';
  let tooltip = '';

  if (liveError) {
    dotClass = 'bg-aura-red';
    tooltip = 'Live data error';
  } else if (liveLoading) {
    dotClass = 'bg-aura-amber animate-pulse-dot';
    tooltip = 'Refreshing live data...';
  } else if (minutesAgo > 10) {
    dotClass = 'bg-aura-amber animate-pulse-dot';
    tooltip = `Live data: ${minutesAgo} min ago — stale`;
  } else {
    dotClass = 'bg-aura-green animate-pulse-dot';
    tooltip = `Live data: ${minutesAgo} min ago`;
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setSearchOpen(!searchOpen);
    }
    if (e.key === '/') {
      e.preventDefault();
      setSearchOpen(true);
    }
  }, [searchOpen, setSearchOpen]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-12 bg-aura-base/95 backdrop-blur-md border-b border-aura-border flex items-center px-4">
      <div className="flex items-center gap-2 min-w-[200px]">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className={`w-2 h-2 rounded-full ${dotClass}`} title={tooltip} />
          </div>
          <a href="/" className="text-lg font-bold tracking-tight text-aura-textPrimary hover:text-aura-blue transition-colors">AURA</a>
        </div>
        <span className={`text-2xs font-mono uppercase tracking-wider ${getStatusTextColor(overallStatus)}`}>
          {overallStatus}
        </span>
      </div>

      <div className="flex-1 flex justify-center">
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-aura-surface border border-aura-border text-aura-textSecondary text-sm hover:border-aura-textMuted transition-colors w-80 max-w-full"
        >
          <Search size={14} />
          <span className="flex-1 text-left">Search models, providers...</span>
          <kbd className="text-2xs font-mono bg-aura-base px-1.5 py-0.5 rounded border border-aura-border">⌘K</kbd>
        </button>
      </div>

      <div className="flex items-center gap-3 min-w-[200px] justify-end">
        <select
          value={currency}
          onChange={e => setCurrency(e.target.value as never)}
          className="bg-aura-surface border border-aura-border rounded px-2 py-1 text-xs font-mono text-aura-textSecondary focus:outline-none focus:border-aura-textMuted"
        >
          {currencies.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <div className="relative">
          <Bell size={14} className="text-aura-textSecondary hover:text-aura-textPrimary transition-colors cursor-pointer" />
          {triggeredCount > 0 && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-aura-red text-white text-[8px] flex items-center justify-center font-bold">
              {triggeredCount > 9 ? '9+' : triggeredCount}
            </span>
          )}
        </div>

        <a
          href="https://github.com/aura/terminal"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-aura-textSecondary hover:text-aura-textPrimary transition-colors text-sm"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
          <span className="font-mono text-xs">12.4k</span>
        </a>

        <a
          href="/simulate"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-aura-blue text-white text-xs font-medium hover:bg-aura-blue/90 transition-colors"
        >
          <ExternalLink size={12} />
          Deploy Probe
        </a>
      </div>
    </header>
  );
};
