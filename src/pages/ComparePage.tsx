import { useState, useEffect, useMemo } from 'react';
import { X, Plus, Share2, Download } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import SearchBar from '../components/search/SearchBar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { fetchProductSummaries, fetchPriceChanges, fetchLatestPrices } from '../lib/api';
import { formatNaira, formatChange, formatNairaFull } from '../lib/format';
import { products } from '../data/mockData';
import type { CompareItem, SearchResult, ProductPriceSummary, PriceChange, LatestPrice } from '../types/database';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'];

interface ComparePageProps {
  items: CompareItem[];
  onRemove: (productId: string, locationId?: string) => void;
  onAdd: (productId: string) => void;
  onClear: () => void;
}

export default function ComparePage({ items, onRemove, onAdd }: ComparePageProps) {
  const [summaries, setSummaries] = useState<ProductPriceSummary[]>([]);
  const [changes, setChanges] = useState<PriceChange[]>([]);
  const [allPrices, setAllPrices] = useState<LatestPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchProductSummaries(),
      fetchPriceChanges(7, 50),
      ...items.map(item => fetchLatestPrices(item.productId)),
    ]).then(([sums, ch, ...priceResults]) => {
      setSummaries(sums);
      setChanges(ch);
      setAllPrices(priceResults.flat());
      setLoading(false);
    });
  }, [items]);

  const compareData = useMemo(() => {
    return items.map((item, index) => {
      const product = products.find(p => p.id === item.productId);
      const summary = summaries.find(s => s.product_id === item.productId);
      const change = changes.find(c => c.product_id === item.productId);
      const prices = allPrices.filter(p => p.product_id === item.productId);

      const cheapestLocation = prices.length > 0
        ? prices.reduce((min, p) => p.price < min.price ? p : min, prices[0])
        : null;
      const expensiveLocation = prices.length > 0
        ? prices.reduce((max, p) => p.price > max.price ? p : max, prices[0])
        : null;

      return {
        index,
        productId: item.productId,
        name: product?.name || 'Unknown',
        unit: product?.unit || '',
        color: COLORS[index % COLORS.length],
        avgPrice: summary?.avg_price || 0,
        minPrice: summary?.min_price || 0,
        maxPrice: summary?.max_price || 0,
        changePct: change?.change_pct || 0,
        cheapestLocation: cheapestLocation?.location_name || '-',
        cheapestPrice: cheapestLocation?.price || 0,
        expensiveLocation: expensiveLocation?.location_name || '-',
        expensivePrice: expensiveLocation?.price || 0,
        dataPoints: summary?.data_points || 0,
      };
    });
  }, [items, summaries, changes, allPrices]);

  function handleSearchSelect(result: SearchResult) {
    onAdd(result.id);
    setShowSearch(false);
  }

  function handleShare() {
    const params = items.map(i => i.productId).join(',');
    const url = `${window.location.origin}/compare?items=${params}`;
    navigator.clipboard.writeText(url).catch(() => {});
  }

  function handleExport() {
    const headers = ['Product', 'Avg Price', 'Min Price', 'Max Price', 'Change %', 'Cheapest Location', 'Most Expensive Location'];
    const rows = compareData.map(d => [
      d.name,
      d.avgPrice.toString(),
      d.minPrice.toString(),
      d.maxPrice.toString(),
      d.changePct.toString(),
      d.cheapestLocation,
      d.expensiveLocation,
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pricewise-comparison.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading && items.length > 0) return <LoadingSpinner />;

  // Chart data for bar comparison
  const chartData = compareData.map(d => ({
    name: d.name.length > 15 ? d.name.substring(0, 15) + '...' : d.name,
    'Avg Price': d.avgPrice,
    'Min Price': d.minPrice,
    'Max Price': d.maxPrice,
  }));

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>Compare Prices</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
        Compare up to 4 products side by side across locations and time periods.
      </p>

      {/* Selection Bar */}
      <div className="compare-selection-bar">
        {compareData.map(item => (
          <div
            key={item.productId}
            className="compare-chip"
            style={{ borderLeft: `3px solid ${item.color}` }}
          >
            <span>{item.name}</span>
            <button
              className="compare-chip-remove"
              onClick={() => onRemove(item.productId)}
              aria-label={`Remove ${item.name}`}
            >
              <X size={14} />
            </button>
          </div>
        ))}
        {items.length < 4 && (
          <button className="compare-add-btn" onClick={() => setShowSearch(!showSearch)}>
            <Plus size={14} style={{ marginRight: 4 }} />
            Add Item
          </button>
        )}
        {items.length > 0 && (
          <>
            <button className="btn btn-secondary" onClick={handleShare} style={{ marginLeft: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}>
              <Share2 size={14} style={{ marginRight: 4 }} /> Share
            </button>
            <button className="btn btn-secondary" onClick={handleExport} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
              <Download size={14} style={{ marginRight: 4 }} /> CSV
            </button>
          </>
        )}
      </div>

      {/* Search for adding items */}
      {showSearch && (
        <div style={{ marginBottom: 24 }}>
          <SearchBar
            placeholder="Search for a product to compare..."
            onSelect={handleSearchSelect}
          />
        </div>
      )}

      {items.length === 0 ? (
        <div className="empty-state" style={{ paddingTop: 60 }}>
          <h3>No items selected</h3>
          <p style={{ marginBottom: 16 }}>Add products to compare their prices across locations.</p>
          <button className="btn btn-primary" onClick={() => setShowSearch(true)}>
            <Plus size={16} style={{ marginRight: 6 }} /> Add Products to Compare
          </button>
        </div>
      ) : (
        <>
          {/* Comparison Table */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <h3 className="card-title">Side-by-Side Comparison</h3>
            </div>
            <div className="data-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    {compareData.map(d => (
                      <th key={d.productId} style={{ color: d.color }}>
                        {d.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Current Avg Price</td>
                    {compareData.map(d => (
                      <td key={d.productId} className="price-cell">{formatNairaFull(d.avgPrice)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Min Price</td>
                    {compareData.map(d => (
                      <td key={d.productId} className="price-cell">{formatNairaFull(d.minPrice)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Max Price</td>
                    {compareData.map(d => (
                      <td key={d.productId} className="price-cell">{formatNairaFull(d.maxPrice)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>7-Day Change</td>
                    {compareData.map(d => {
                      const ch = formatChange(d.changePct);
                      return (
                        <td key={d.productId} className={`change-cell ${ch.className}`}>{ch.text}</td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Cheapest Location</td>
                    {compareData.map(d => (
                      <td key={d.productId}>
                        <div>{d.cheapestLocation}</div>
                        <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--green)' }}>
                          {d.cheapestPrice > 0 ? formatNaira(d.cheapestPrice) : '-'}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Most Expensive Location</td>
                    {compareData.map(d => (
                      <td key={d.productId}>
                        <div>{d.expensiveLocation}</div>
                        <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--red)' }}>
                          {d.expensivePrice > 0 ? formatNaira(d.expensivePrice) : '-'}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Data Points</td>
                    {compareData.map(d => (
                      <td key={d.productId}>{d.dataPoints}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Bar Chart Comparison */}
          {chartData.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Price Comparison Chart</h3>
              </div>
              <div className="card-body">
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a3040" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={12} tick={{ fill: '#64748b' }} />
                      <YAxis stroke="#64748b" fontSize={12} tick={{ fill: '#64748b' }} tickFormatter={(v) => formatNaira(v)} width={80} />
                      <Tooltip
                        contentStyle={{ background: '#1a1f2e', border: '1px solid #2a3040', borderRadius: '8px', color: '#f1f5f9' }}
                        formatter={(value) => [formatNaira(Number(value ?? 0)), '']}
                      />
                      <Legend />
                      <Bar dataKey="Min Price" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Avg Price" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Max Price" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
