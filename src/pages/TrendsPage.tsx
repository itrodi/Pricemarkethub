import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { fetchPriceChanges, fetchCategories, fetchProductSummaries } from '../lib/api';
import { formatNaira, formatChange } from '../lib/format';
import { pricePoints, products } from '../data/mockData';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import type { PriceChange, Category } from '../types/database';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

export default function TrendsPage() {
  const [changes, setChanges] = useState<PriceChange[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [, setSummaries] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(7);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetchPriceChanges(timeRange, 50),
      fetchCategories(),
      fetchProductSummaries(),
    ]).then(([ch, cats, sums]) => {
      setChanges(ch);
      setCategories(cats);
      setSummaries(sums);
      setLoading(false);
    });
  }, [timeRange]);

  // Price indices by category (average change for all products in category)
  const categoryIndices = useMemo(() => {
    return categories.map(cat => {
      const catChanges = changes.filter(c => c.category_id === cat.id);
      const avgChange = catChanges.length > 0
        ? catChanges.reduce((sum, c) => sum + c.change_pct, 0) / catChanges.length
        : 0;
      return {
        category: cat.name,
        color: cat.color,
        avgChange: Math.round(avgChange * 100) / 100,
        itemCount: catChanges.length,
      };
    }).filter(ci => ci.itemCount > 0)
      .sort((a, b) => b.avgChange - a.avgChange);
  }, [categories, changes]);

  // Top movers
  const topGainers = useMemo(() =>
    changes.filter(c => c.change_pct > 0).sort((a, b) => b.change_pct - a.change_pct).slice(0, 5),
    [changes]
  );
  const topDecliners = useMemo(() =>
    changes.filter(c => c.change_pct < 0).sort((a, b) => a.change_pct - b.change_pct).slice(0, 5),
    [changes]
  );

  // Build index chart data - Food Price Index (Agriculture products)
  const indexChartData = useMemo(() => {
    const agriProducts = products.filter(p => p.category_id === 'cat-agriculture').slice(0, 5);
    const days = 30;
    const dateMap = new Map<string, Record<string, number>>();

    for (const product of agriProducts) {
      const points = pricePoints
        .filter(pp => pp.product_id === product.id)
        .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());

      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);

      for (const pp of points) {
        if (new Date(pp.recorded_at) < cutoff) continue;
        const date = new Date(pp.recorded_at).toISOString().split('T')[0];
        if (!dateMap.has(date)) dateMap.set(date, {});
        const existing = dateMap.get(date)!;
        if (!existing[product.name]) {
          existing[product.name] = pp.price;
        }
      }
    }

    return Array.from(dateMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, values]) => ({
        date: new Date(date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }),
        ...values,
      }));
  }, []);

  // Weekly summary text
  const summaryText = useMemo(() => {
    if (changes.length === 0) return '';
    const biggestGainer = topGainers[0];
    const biggestDecliner = topDecliners[0];
    const avgChange = changes.reduce((sum, c) => sum + c.change_pct, 0) / changes.length;
    const direction = avgChange > 0 ? 'upward' : avgChange < 0 ? 'downward' : 'flat';

    let text = `This week, the overall price trend across Nigerian markets is ${direction} with an average movement of ${formatChange(avgChange).text}. `;
    if (biggestGainer) {
      text += `${biggestGainer.product_name} saw the largest increase at ${formatChange(biggestGainer.change_pct).text}, `;
      text += `with prices moving from ${formatNaira(biggestGainer.previous_avg)} to ${formatNaira(biggestGainer.current_avg)}. `;
    }
    if (biggestDecliner) {
      text += `${biggestDecliner.product_name} declined the most at ${formatChange(biggestDecliner.change_pct).text}. `;
    }
    return text;
  }, [changes, topGainers, topDecliners]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>Market Trends</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>
        Data-driven insights about the Nigerian price economy. Updated daily.
      </p>

      {/* Time Range Toggle */}
      <div className="filter-bar" style={{ marginBottom: 32 }}>
        <div className="chart-controls">
          {[
            { label: '7 Days', value: 7 },
            { label: '30 Days', value: 30 },
            { label: '90 Days', value: 90 },
          ].map(range => (
            <button
              key={range.value}
              className={`chart-btn ${timeRange === range.value ? 'active' : ''}`}
              onClick={() => setTimeRange(range.value)}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="trends-summary">
        <h2>Weekly Market Summary</h2>
        <p>{summaryText}</p>
      </div>

      {/* Category Price Indices */}
      <section className="section" style={{ paddingTop: 0 }}>
        <h2 className="section-title" style={{ marginBottom: 16 }}>Category Price Indices</h2>
        <div className="insights-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {categoryIndices.map(ci => {
            const change = formatChange(ci.avgChange);
            return (
              <div key={ci.category} className="insight-card">
                <div className="insight-label">{ci.category}</div>
                <div className={`insight-value ${change.className}`} style={{ fontSize: '1.1rem' }}>
                  {change.text}
                </div>
                <div className="insight-detail">{ci.itemCount} items tracked</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Food Price Index Chart */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Food Price Index (30 Days)</h3>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={indexChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3040" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} tick={{ fill: '#64748b' }} />
                  <YAxis stroke="#64748b" fontSize={12} tick={{ fill: '#64748b' }} tickFormatter={v => formatNaira(v)} width={80} />
                  <Tooltip
                    contentStyle={{ background: '#1a1f2e', border: '1px solid #2a3040', borderRadius: '8px', color: '#f1f5f9' }}
                    formatter={(value) => [formatNaira(Number(value ?? 0)), '']}
                  />
                  <Legend />
                  {products
                    .filter(p => p.category_id === 'cat-agriculture')
                    .slice(0, 5)
                    .map((product, i) => (
                      <Line
                        key={product.id}
                        type="monotone"
                        dataKey={product.name}
                        stroke={COLORS[i % COLORS.length]}
                        strokeWidth={2}
                        dot={false}
                      />
                    ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Top Movers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Top Gainers */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={16} color="var(--green)" /> Top Gainers
            </h3>
          </div>
          <div className="data-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Price</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                {topGainers.map(item => {
                  const ch = formatChange(item.change_pct);
                  return (
                    <tr
                      key={item.product_id}
                      onClick={() => navigate(`/product/${item.product_slug}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ fontWeight: 500 }}>{item.product_name}</td>
                      <td className="price-cell">{formatNaira(item.current_avg)}</td>
                      <td className={`change-cell ${ch.className}`}>{ch.text}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Decliners */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingDown size={16} color="var(--red)" /> Top Decliners
            </h3>
          </div>
          <div className="data-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Price</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                {topDecliners.map(item => {
                  const ch = formatChange(item.change_pct);
                  return (
                    <tr
                      key={item.product_id}
                      onClick={() => navigate(`/product/${item.product_slug}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ fontWeight: 500 }}>{item.product_name}</td>
                      <td className="price-cell">{formatNaira(item.current_avg)}</td>
                      <td className={`change-cell ${ch.className}`}>{ch.text}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* All Price Changes */}
      <section className="section" style={{ paddingTop: 0 }}>
        <h2 className="section-title" style={{ marginBottom: 16 }}>All Price Changes ({timeRange}d)</h2>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Previous Avg</th>
                <th>Current Avg</th>
                <th>Change</th>
                <th>Absolute Change</th>
              </tr>
            </thead>
            <tbody>
              {changes.map(item => {
                const ch = formatChange(item.change_pct);
                const cat = categories.find(c => c.id === item.category_id);
                return (
                  <tr
                    key={item.product_id}
                    onClick={() => navigate(`/product/${item.product_slug}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ fontWeight: 500 }}>{item.product_name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{cat?.name || '-'}</td>
                    <td className="price-cell">{formatNaira(item.previous_avg)}</td>
                    <td className="price-cell">{formatNaira(item.current_avg)}</td>
                    <td className={`change-cell ${ch.className}`}>{ch.text}</td>
                    <td className={`change-cell ${item.abs_change >= 0 ? 'change-up' : 'change-down'}`}>
                      {item.abs_change >= 0 ? '+' : ''}{formatNaira(Math.abs(item.abs_change))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
