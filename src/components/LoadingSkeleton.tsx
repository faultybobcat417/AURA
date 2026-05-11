import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen pt-28 px-4 pb-12 animate-pulse">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="h-8 bg-aura-surface rounded w-1/3" />
        <div className="h-4 bg-aura-surface rounded w-1/4" />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left column */}
          <div className="lg:col-span-3 space-y-4">
            <div className="h-[320px] bg-aura-surface rounded border border-aura-border" />
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-aura-surface rounded border border-aura-border" />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-14 bg-aura-surface rounded border border-aura-border" />
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="h-32 bg-aura-surface rounded border border-aura-border" />
            <div className="h-48 bg-aura-surface rounded border border-aura-border" />
            <div className="h-40 bg-aura-surface rounded border border-aura-border" />
          </div>
        </div>
      </div>
    </div>
  );
};

export function ShimmerCard({ className }: { className?: string }) {
  return (
    <div className={`bg-aura-surface rounded border border-aura-border animate-pulse ${className || ''}`}>
      <div className="p-3 space-y-2">
        <div className="h-3 bg-aura-base rounded w-1/3" />
        <div className="h-4 bg-aura-base rounded w-2/3" />
      </div>
    </div>
  );
}
