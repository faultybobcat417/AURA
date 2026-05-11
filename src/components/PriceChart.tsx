import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { createChart, CandlestickSeries, HistogramSeries, LineSeries } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, CandlestickData, HistogramData, LineData, Time } from 'lightweight-charts';
import { BarChart3, LineChart as LineChartIcon, Bell } from 'lucide-react';
import type { OHLCPoint, TimeFrame } from '../types';
import { getStatsFromHistory, aggregateToTimeFrame } from '../lib/historyGenerator';
import { formatCurrency, formatPercent, cn } from '../lib/utils';

const timeFrames: TimeFrame[] = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];

interface PriceChartProps {
  history: OHLCPoint[];
  currency: string;
  modelName: string;
  onSetAlert?: (price: number) => void;
}

function toTime(t: number): Time {
  return t as unknown as Time;
}

export const PriceChart: React.FC<PriceChartProps> = ({ history, currency, onSetAlert }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const smaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1M');
  const [chartType, setChartType] = useState<'candle' | 'area'>('candle');
  const [showSMA, setShowSMA] = useState(false);
  const [hoverPrice, setHoverPrice] = useState<string | null>(null);

  const data = useMemo(() => aggregateToTimeFrame(history, timeFrame), [history, timeFrame]);
  const stats = useMemo(() => getStatsFromHistory(history), [history]);

  const calculateSMA = useCallback((data: OHLCPoint[], period: number): LineData[] => {
    const result: LineData[] = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b.close, 0);
      result.push({ time: toTime(data[i].time), value: sum / period });
    }
    return result;
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#0B0E14' },
        textColor: '#8B93A7',
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.04)' },
        horzLines: { color: 'rgba(255,255,255,0.04)' },
      },
      crosshair: {
        mode: 0,
        vertLine: { color: 'rgba(255,255,255,0.2)', width: 1, style: 2 },
        horzLine: { color: 'rgba(255,255,255,0.2)', width: 1, style: 2 },
      },
      rightPriceScale: {
        borderColor: 'rgba(255,255,255,0.06)',
      },
      timeScale: {
        borderColor: 'rgba(255,255,255,0.06)',
        timeVisible: true,
      },
      autoSize: true,
    });

    chartRef.current = chart;

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#00C853',
      downColor: '#FF3D00',
      borderUpColor: '#00C853',
      borderDownColor: '#FF3D00',
      wickUpColor: '#00C853',
      wickDownColor: '#FF3D00',
    });
    candleSeriesRef.current = candleSeries;

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#2979FF',
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    });
    volumeSeriesRef.current = volumeSeries;

    chart.subscribeCrosshairMove(param => {
      if (param.time && param.point) {
        const price = param.point.y;
        setHoverPrice(formatCurrency(price, currency));
      } else {
        setHoverPrice(null);
      }
    });

    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, [currency]);

  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || !data.length) return;

    const candleData: CandlestickData[] = data.map(d => ({
      time: toTime(d.time),
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    const volumeData: HistogramData[] = data.map(d => ({
      time: toTime(d.time),
      value: d.volume,
      color: d.close >= d.open ? 'rgba(0,200,83,0.4)' : 'rgba(255,61,0,0.4)',
    }));

    candleSeriesRef.current.setData(candleData);
    volumeSeriesRef.current.setData(volumeData);

    candleSeriesRef.current.applyOptions({
      visible: chartType === 'candle',
    });

    if (smaSeriesRef.current) {
      chartRef.current?.removeSeries(smaSeriesRef.current);
      smaSeriesRef.current = null;
    }

    if (showSMA) {
      const smaData = calculateSMA(data, 20);
      const line = chartRef.current!.addSeries(LineSeries, {
        color: '#FFB300',
        lineWidth: 1,
        title: 'SMA(20)',
      });
      line.setData(smaData);
      smaSeriesRef.current = line;
    }

    chartRef.current?.timeScale().fitContent();
  }, [data, chartType, showSMA, calculateSMA]);

  const handleSetAlertFromCrosshair = () => {
    if (!chartRef.current) return;
    const coordinate = chartRef.current.paneSize().height / 2;
    const price = candleSeriesRef.current?.coordinateToPrice(coordinate);
    if (price !== null && price !== undefined) {
      const target = Math.round(Number(price) * 100) / 100;
      onSetAlert?.(target);
    }
  };

  return (
    <div className="space-y-3">
      {/* Stats bar */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="bg-aura-base rounded border border-aura-border p-2">
            <div className="text-2xs text-aura-textMuted">Current</div>
            <div className="text-sm font-mono font-semibold text-aura-textPrimary">{formatCurrency(stats.current, currency)}</div>
          </div>
          <div className="bg-aura-base rounded border border-aura-border p-2">
            <div className="text-2xs text-aura-textMuted">24h Change</div>
            <div className={`text-sm font-mono font-semibold ${stats.change24h < 0 ? 'text-aura-green' : stats.change24h > 0 ? 'text-aura-red' : 'text-aura-textSecondary'}`}>
              {formatPercent(stats.change24h, true)}
            </div>
          </div>
          <div className="bg-aura-base rounded border border-aura-border p-2">
            <div className="text-2xs text-aura-textMuted">24h Range</div>
            <div className="text-sm font-mono text-aura-textPrimary">{formatCurrency(stats.day24Low, currency)} - {formatCurrency(stats.day24High, currency)}</div>
          </div>
          <div className="bg-aura-base rounded border border-aura-border p-2">
            <div className="text-2xs text-aura-textMuted">30d Avg</div>
            <div className="text-sm font-mono text-aura-textPrimary">{formatCurrency(stats.avg30d, currency)}</div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1">
          {timeFrames.map(tf => (
            <button
              key={tf}
              onClick={() => setTimeFrame(tf)}
              className={cn(
                'px-2 py-0.5 rounded text-2xs font-mono transition-colors',
                timeFrame === tf
                  ? 'bg-aura-blue/20 text-aura-blue border border-aura-blue/30'
                  : 'text-aura-textMuted hover:text-aura-textSecondary border border-transparent'
              )}
            >
              {tf}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setChartType(chartType === 'candle' ? 'area' : 'candle')}
            className="p-1 rounded hover:bg-white/5 text-aura-textMuted hover:text-aura-textPrimary"
            title={chartType === 'candle' ? 'Switch to area' : 'Switch to candle'}
          >
            {chartType === 'candle' ? <BarChart3 size={14} /> : <LineChartIcon size={14} />}
          </button>
          <button
            onClick={() => setShowSMA(!showSMA)}
            className={cn(
              'px-2 py-0.5 rounded text-2xs border transition-colors',
              showSMA
                ? 'bg-aura-amber/10 text-aura-amber border-aura-amber/30'
                : 'text-aura-textMuted border-aura-border hover:text-aura-textSecondary'
            )}
          >
            SMA(20)
          </button>
          <button
            onClick={handleSetAlertFromCrosshair}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-2xs border border-aura-border text-aura-textMuted hover:text-aura-textPrimary transition-colors"
          >
            <Bell size={10} /> Alert
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <div ref={chartContainerRef} className="h-[320px] w-full rounded border border-aura-border bg-aura-base" />
        {hoverPrice && (
          <div className="absolute top-2 right-2 bg-aura-surface border border-aura-border rounded px-2 py-1 text-xs font-mono text-aura-textPrimary">
            {hoverPrice}
          </div>
        )}
      </div>

      {/* All-time stats */}
      {stats && (
        <div className="flex items-center gap-4 text-2xs text-aura-textMuted">
          <span>ATH: <span className="font-mono text-aura-textSecondary">{formatCurrency(stats.allTimeHigh, currency)}</span></span>
          <span>ATL: <span className="font-mono text-aura-textSecondary">{formatCurrency(stats.allTimeLow, currency)}</span></span>
          <span>Avg Vol: <span className="font-mono text-aura-textSecondary">{stats.avgVolume.toLocaleString()}</span></span>
        </div>
      )}
    </div>
  );
};
