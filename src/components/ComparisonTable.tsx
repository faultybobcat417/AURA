import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
} from '@tanstack/react-table';
import { ArrowUpDown, Star, Filter, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Sparkline } from './Sparkline';
import {
  formatCurrency,
  formatLatency,
  formatPercent,
  formatNumber,
  getLatencyColor,
  getChangeColor,
  getStatusColor,
} from '../lib/utils';
import type { Model, Modality, UseCase } from '../types';

const modalities: Modality[] = ['Text', 'Vision', 'Audio', 'Multimodal'];
const useCases: UseCase[] = ['Coding', 'Reasoning', 'Creative', 'Enterprise', 'General'];

export const ComparisonTable: React.FC = () => {
  const { currency, filters, setFilter, clearFilters, toggleWatchlist, isInWatchlist, toggleCompare, compareModelIds, liveModels, liveError } = useAppStore();
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([{ id: 'uem', desc: true }]);

  const filteredData = useMemo(() => {
    return liveModels.filter(m => {
      if (filters.modalities.length > 0 && !filters.modalities.includes(m.modality)) return false;
      if (filters.useCases.length > 0 && !m.useCases.some(uc => filters.useCases.includes(uc))) return false;
      if (filters.providers.length > 0 && !filters.providers.includes(m.providerId as never)) return false;
      return true;
    });
  }, [liveModels, filters]);

  const columns = useMemo<ColumnDef<Model>[]>(() => [
    {
      id: 'select',
      header: '',
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={compareModelIds.includes(row.original.id)}
          onChange={() => toggleCompare(row.original.id)}
          className="rounded border-aura-border bg-aura-base text-aura-blue focus:ring-0"
        />
      ),
      size: 32,
    },
    {
      accessorKey: 'name',
      header: 'Model',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button onClick={e => { e.stopPropagation(); toggleWatchlist(row.original.id); }}>
            <Star size={12} className={isInWatchlist(row.original.id) ? 'text-aura-amber fill-aura-amber' : 'text-aura-textMuted hover:text-aura-amber'} />
          </button>
          <button onClick={() => navigate(`/model/${row.original.id}`)} className="text-left">
            <div className="flex items-center gap-1.5">
              <div className="text-xs font-medium text-aura-textPrimary hover:text-aura-blue transition-colors">{row.original.name}</div>
              {!liveError && liveModels.some(m => m.id === row.original.id) && (
                <div className="w-1 h-1 rounded-full bg-aura-green" title="Real-time pricing from OpenRouter" />
              )}
            </div>
            <div className="text-2xs text-aura-textMuted">{row.original.providerName}</div>
          </button>
        </div>
      ),
    },
    {
      accessorKey: 'modality',
      header: 'Modality',
      cell: ({ getValue }) => (
        <span className="text-2xs px-1.5 py-0.5 rounded bg-white/5 text-aura-textSecondary">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'effectiveCostPer1M',
      header: 'Cost/1M',
      cell: ({ row }) => (
        <span className="text-xs font-mono text-aura-textPrimary">
          {formatCurrency(row.original.effectiveCostPer1M, currency)}
        </span>
      ),
    },
    {
      accessorKey: 'latencyP50',
      header: 'P50',
      cell: ({ getValue }) => (
        <span className={`text-xs font-mono ${getLatencyColor(getValue() as number)}`}>
          {formatLatency(getValue() as number)}
        </span>
      ),
    },
    {
      accessorKey: 'latencyP99',
      header: 'P99',
      cell: ({ getValue }) => (
        <span className="text-xs font-mono text-aura-textSecondary">{formatLatency(getValue() as number)}</span>
      ),
    },
    {
      accessorKey: 'benchmarkScore',
      header: 'Bench',
      cell: ({ getValue }) => (
        <span className="text-xs font-mono text-aura-textPrimary">{formatNumber(getValue() as number)}</span>
      ),
    },
    {
      accessorKey: 'uem',
      header: 'UEM',
      cell: ({ getValue }) => {
        const val = getValue() as number;
        return (
          <span className="text-xs font-mono font-medium text-aura-blue">
            {val > 100 ? '∞' : formatNumber(val)}
          </span>
        );
      },
    },
    {
      accessorKey: 'change24h',
      header: '24h',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Sparkline
            data={row.original.sparkline}
            width={50}
            height={16}
            color={row.original.change24h < 0 ? '#00C853' : row.original.change24h > 0 ? '#FF3D00' : '#8B93A7'}
          />
          <span className={`text-xs font-mono ${getChangeColor(row.original.change24h)}`}>
            {formatPercent(row.original.change24h, true)}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(getValue() as string)}`} />
          <span className="text-2xs text-aura-textSecondary capitalize">{getValue() as string}</span>
        </div>
      ),
    },
  ], [currency, compareModelIds, isInWatchlist, liveModels, liveError]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const toggleFilter = (key: 'modalities' | 'useCases', value: string) => {
    const current = filters[key];
    const updated = current.includes(value as string & never) ? current.filter(v => v !== value) : [...current, value as string & never];
    setFilter(key, updated);
  };

  const hasFilters = filters.modalities.length > 0 || filters.useCases.length > 0 || filters.providers.length > 0;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-1">
          <Filter size={10} className="text-aura-textMuted" />
          <span className="text-2xs text-aura-textMuted uppercase tracking-wider">Modality</span>
        </div>
        {modalities.map(m => (
          <button
            key={m}
            onClick={() => toggleFilter('modalities', m)}
            className={`px-2 py-0.5 rounded text-2xs border transition-colors ${filters.modalities.includes(m) ? 'bg-aura-blue/20 border-aura-blue text-aura-blue' : 'bg-transparent border-aura-border text-aura-textMuted hover:text-aura-textSecondary'}`}
          >
            {m}
          </button>
        ))}
        <div className="w-px h-3 bg-aura-border mx-1" />
        <span className="text-2xs text-aura-textMuted uppercase tracking-wider">Use Case</span>
        {useCases.map(u => (
          <button
            key={u}
            onClick={() => toggleFilter('useCases', u)}
            className={`px-2 py-0.5 rounded text-2xs border transition-colors ${filters.useCases.includes(u) ? 'bg-aura-blue/20 border-aura-blue text-aura-blue' : 'bg-transparent border-aura-border text-aura-textMuted hover:text-aura-textSecondary'}`}
          >
            {u}
          </button>
        ))}
        {hasFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1 text-2xs text-aura-red hover:text-aura-red/80">
            <X size={10} /> Clear
          </button>
        )}
      </div>

      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id} className="border-b border-aura-border">
                  {hg.headers.map(h => (
                    <th
                      key={h.id}
                      className="px-3 py-2 text-2xs font-medium text-aura-textMuted uppercase tracking-wider cursor-pointer select-none hover:text-aura-textSecondary"
                      onClick={h.column.getToggleSortingHandler()}
                      style={{ width: h.getSize() }}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {h.column.getCanSort() && <ArrowUpDown size={10} className="opacity-40" />}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  className="border-b border-aura-border/50 hover:bg-white/[0.02] transition-colors"

                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-3 py-2 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {compareModelIds.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-aura-surface border border-aura-border rounded-lg shadow-2xl px-4 py-3 flex items-center gap-4">
          <span className="text-xs text-aura-textSecondary">{compareModelIds.length} selected</span>
          <div className="flex items-center gap-2">
            {compareModelIds.map(id => {
              const m = liveModels.find(model => model.id === id);
              return (
                <span key={id} className="text-2xs px-2 py-1 rounded bg-aura-base border border-aura-border text-aura-textPrimary">
                  {m?.name}
                </span>
              );
            })}
          </div>
          <button
            onClick={() => compareModelIds.forEach(id => toggleCompare(id))}
            className="text-2xs text-aura-textMuted hover:text-aura-textPrimary"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};
