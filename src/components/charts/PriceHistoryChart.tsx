import { useState, useEffect, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { fetchPriceHistory } from '../../lib/api';
import { formatNaira } from '../../lib/format';
import type { PriceHistoryPoint } from '../../types/database';
import LoadingSpinner from '../ui/LoadingSpinner';

interface PriceHistoryChartProps {
  productId: string;
  locationId?: string;
}

const TIME_RANGES = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316', '#ef4444'];

export default function PriceHistoryChart({ productId, locationId }: PriceHistoryChartProps) {
  const [data, setData] = useState<PriceHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    fetchPriceHistory(productId, locationId, days)
      .then(setData)
      .finally(() => setLoading(false));
  }, [productId, locationId, days]);

  const chartData = useMemo(() => {
    // Group by date, pivot locations into columns
    const dateMap = new Map<string, Record<string, number>>();
    const locationSet = new Set<string>();

    for (const point of data) {
      locationSet.add(point.location_name);
      if (!dateMap.has(point.recorded_date)) {
        dateMap.set(point.recorded_date, {});
      }
      dateMap.get(point.recorded_date)![point.location_name] = point.avg_price;
    }

    const dates = Array.from(dateMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, values]) => ({
        date: new Date(date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }),
        ...values,
      }));

    return { dates, locations: Array.from(locationSet) };
  }, [data]);

  if (loading) return <LoadingSpinner />;

  if (chartData.dates.length === 0) {
    return <div className="empty-state"><h3>No price history available</h3></div>;
  }

  return (
    <div>
      <div className="card-header">
        <h3 className="card-title">Price History</h3>
        <div className="chart-controls">
          {TIME_RANGES.map(range => (
            <button
              key={range.days}
              className={`chart-btn ${days === range.days ? 'active' : ''}`}
              onClick={() => setDays(range.days)}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
      <div className="card-body">
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData.dates}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3040" />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={12}
                tick={{ fill: '#64748b' }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tick={{ fill: '#64748b' }}
                tickFormatter={(v) => formatNaira(v)}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  background: '#1a1f2e',
                  border: '1px solid #2a3040',
                  borderRadius: '8px',
                  color: '#f1f5f9',
                }}
                formatter={(value) => [formatNaira(Number(value ?? 0)), '']}
              />
              {chartData.locations.length > 1 && <Legend />}
              {chartData.locations.map((location, i) => (
                <Area
                  key={location}
                  type="monotone"
                  dataKey={location}
                  stroke={COLORS[i % COLORS.length]}
                  fill={COLORS[i % COLORS.length]}
                  fillOpacity={0.1}
                  strokeWidth={2}
                  name={location}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
