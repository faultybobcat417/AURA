import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

interface DataBannerProps {
  source: string;
  onRetry?: () => void;
}

export const DataBanner: React.FC<DataBannerProps> = ({ source, onRetry }) => {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-aura-amber/10 border border-aura-amber/20 rounded text-xs text-aura-amber">
      <WifiOff size={12} />
      <span className="flex-1">Live data from {source} unavailable. Using cached/mock data.</span>
      {onRetry && (
        <button onClick={onRetry} className="flex items-center gap-1 hover:text-aura-amber/80 transition-colors">
          <RefreshCw size={10} /> Retry
        </button>
      )}
    </div>
  );
};
