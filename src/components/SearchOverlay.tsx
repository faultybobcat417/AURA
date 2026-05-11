import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ChevronRight } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { models, providers, benchmarks } from '../data/mockData';

export const SearchOverlay: React.FC = () => {
  const { searchOpen, setSearchOpen } = useAppStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      inputRef.current?.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [setSearchOpen]);

  if (!searchOpen) return null;

  const q = query.toLowerCase();
  const modelResults = models.filter(m => m.name.toLowerCase().includes(q) || m.providerName.toLowerCase().includes(q)).slice(0, 5);
  const providerResults = providers.filter(p => p.name.toLowerCase().includes(q)).slice(0, 3);
  const benchmarkResults = benchmarks.filter(b => b.name.toLowerCase().includes(q)).slice(0, 3);

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex justify-center pt-24">
      <div className="w-full max-w-xl bg-aura-surface border border-aura-border rounded-lg shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-aura-border">
          <Search size={16} className="text-aura-textMuted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search models, providers, benchmarks..."
            className="flex-1 bg-transparent text-sm text-aura-textPrimary placeholder:text-aura-textMuted focus:outline-none"
          />
          <button onClick={() => setSearchOpen(false)} className="text-aura-textMuted hover:text-aura-textPrimary">
            <X size={14} />
          </button>
        </div>
        <div className="max-h-[400px] overflow-y-auto py-2">
          {modelResults.length > 0 && (
            <div className="px-2">
              <div className="px-2 py-1 text-2xs font-medium text-aura-textMuted uppercase tracking-wider">Models</div>
              {modelResults.map(m => (
                <button
                  key={m.id}
                  onClick={() => { navigate(`/model/${m.id}`); setSearchOpen(false); setQuery(''); }}
                  className="w-full flex items-center justify-between px-2 py-2 rounded hover:bg-white/[0.05] text-left"
                >
                  <div>
                    <div className="text-sm text-aura-textPrimary">{m.name}</div>
                    <div className="text-2xs text-aura-textMuted">{m.providerName} · {m.modality}</div>
                  </div>
                  <ChevronRight size={14} className="text-aura-textMuted" />
                </button>
              ))}
            </div>
          )}
          {providerResults.length > 0 && (
            <div className="px-2 mt-2">
              <div className="px-2 py-1 text-2xs font-medium text-aura-textMuted uppercase tracking-wider">Providers</div>
              {providerResults.map(p => (
                <button
                  key={p.id}
                  className="w-full flex items-center justify-between px-2 py-2 rounded hover:bg-white/[0.05] text-left"
                >
                  <div className="text-sm text-aura-textPrimary">{p.name}</div>
                  <ChevronRight size={14} className="text-aura-textMuted" />
                </button>
              ))}
            </div>
          )}
          {benchmarkResults.length > 0 && (
            <div className="px-2 mt-2">
              <div className="px-2 py-1 text-2xs font-medium text-aura-textMuted uppercase tracking-wider">Benchmarks</div>
              {benchmarkResults.map(b => (
                <button
                  key={b.id}
                  className="w-full flex items-center justify-between px-2 py-2 rounded hover:bg-white/[0.05] text-left"
                >
                  <div className="text-sm text-aura-textPrimary">{b.name}</div>
                  <ChevronRight size={14} className="text-aura-textMuted" />
                </button>
              ))}
            </div>
          )}
          {query && modelResults.length === 0 && providerResults.length === 0 && benchmarkResults.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-aura-textMuted">No results found for &quot;{query}&quot;</div>
          )}
        </div>
        <div className="px-4 py-2 border-t border-aura-border text-2xs text-aura-textMuted flex items-center justify-between">
          <span>Press <kbd className="font-mono bg-aura-base px-1 rounded border border-aura-border">↵</kbd> to select</span>
          <span><kbd className="font-mono bg-aura-base px-1 rounded border border-aura-border">Esc</kbd> to close</span>
        </div>
      </div>
    </div>
  );
};
