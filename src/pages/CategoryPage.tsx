import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Grid3X3, List } from 'lucide-react';
import {
  fetchCategoryBySlug,
  fetchProductSummaries,
  fetchLocations,
  fetchPriceChanges,
} from '../lib/api';
import { formatNaira, formatChange } from '../lib/format';
import Sparkline from '../components/ui/Sparkline';
import CategoryIcon from '../components/ui/CategoryIcon';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { pricePoints } from '../data/mockData';
import type { Category, ProductPriceSummary, PriceChange } from '../types/database';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [category, setCategory] = useState<Category | null>(null);
  const [summaries, setSummaries] = useState<ProductPriceSummary[]>([]);
  const [changes, setChanges] = useState<PriceChange[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [subcategoryFilter, setSubcategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'change'>('name');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    Promise.all([
      fetchCategoryBySlug(slug),
      fetchLocations(true),
      fetchPriceChanges(7, 50),
    ]).then(([cat, _locs, ch]) => {
      setCategory(cat);
      setChanges(ch);

      if (cat) {
        fetchProductSummaries(cat.id).then(s => {
          setSummaries(s);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
  }, [slug]);

  const subcategories = useMemo(() => {
    const subs = new Set(summaries.map(s => s.subcategory).filter(Boolean));
    return Array.from(subs) as string[];
  }, [summaries]);

  const filteredSummaries = useMemo(() => {
    let filtered = [...summaries];

    if (subcategoryFilter !== 'all') {
      filtered = filtered.filter(s => s.subcategory === subcategoryFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price') return b.avg_price - a.avg_price;
      if (sortBy === 'change') {
        const changeA = changes.find(c => c.product_id === a.product_id)?.change_pct || 0;
        const changeB = changes.find(c => c.product_id === b.product_id)?.change_pct || 0;
        return Math.abs(changeB) - Math.abs(changeA);
      }
      return 0;
    });

    return filtered;
  }, [summaries, subcategoryFilter, sortBy, changes]);

  function getSparklineData(productId: string): number[] {
    return pricePoints
      .filter(pp => pp.product_id === productId)
      .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
      .slice(-14)
      .map(p => p.price);
  }

  if (loading) return <LoadingSpinner />;

  if (!category) {
    return (
      <div className="container">
        <div className="empty-state" style={{ paddingTop: 80 }}>
          <h3>Category not found</h3>
          <p>The category you're looking for doesn't exist.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-block' }}>
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  // Category insights
  const mostExpensive = summaries.reduce((max, s) => s.avg_price > (max?.avg_price || 0) ? s : max, summaries[0]);
  const cheapest = summaries.reduce((min, s) => s.avg_price < (min?.avg_price || Infinity) ? s : min, summaries[0]);
  const mostVolatile = changes
    .filter(c => summaries.some(s => s.product_id === c.product_id))
    .sort((a, b) => Math.abs(b.change_pct) - Math.abs(a.change_pct))[0];

  return (
    <div className="container">
      {/* Category Header */}
      <div className="product-header">
        <div className="product-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>{category.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <CategoryIcon icon={category.icon} color={category.color} size={24} />
          <h1 className="product-title" style={{ marginBottom: 0 }}>{category.name}</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 0 }}>
          {category.description} &mdash; {summaries.length} items tracked
        </p>
      </div>

      {/* Insights */}
      <div className="insights-grid">
        <div className="insight-card">
          <div className="insight-label">Items Tracked</div>
          <div className="insight-value">{summaries.length}</div>
        </div>
        <div className="insight-card">
          <div className="insight-label">Most Expensive</div>
          <div className="insight-value" style={{ fontSize: '1rem' }}>
            {mostExpensive?.name || '-'}
          </div>
          <div className="insight-detail">{mostExpensive ? formatNaira(mostExpensive.avg_price) : ''}</div>
        </div>
        <div className="insight-card">
          <div className="insight-label">Cheapest</div>
          <div className="insight-value" style={{ fontSize: '1rem' }}>
            {cheapest?.name || '-'}
          </div>
          <div className="insight-detail">{cheapest ? formatNaira(cheapest.avg_price) : ''}</div>
        </div>
        <div className="insight-card">
          <div className="insight-label">Most Volatile</div>
          <div className="insight-value" style={{ fontSize: '1rem' }}>
            {mostVolatile?.product_name || '-'}
          </div>
          <div className="insight-detail">
            {mostVolatile ? `${formatChange(mostVolatile.change_pct).text} this week` : ''}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        {subcategories.length > 0 && (
          <select
            value={subcategoryFilter}
            onChange={e => setSubcategoryFilter(e.target.value)}
          >
            <option value="all">All Sub-categories</option>
            {subcategories.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        )}

        <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}>
          <option value="name">Sort by Name</option>
          <option value="price">Sort by Price</option>
          <option value="change">Sort by Change %</option>
        </select>

        <div className="view-toggle">
          <button
            className={viewMode === 'list' ? 'active' : ''}
            onClick={() => setViewMode('list')}
          >
            <List size={16} />
          </button>
          <button
            className={viewMode === 'grid' ? 'active' : ''}
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 size={16} />
          </button>
        </div>
      </div>

      {/* Product Listing */}
      {viewMode === 'list' ? (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Avg Price</th>
                <th>Range</th>
                <th>Change (7d)</th>
                <th>Trend</th>
                <th>Data Points</th>
              </tr>
            </thead>
            <tbody>
              {filteredSummaries.map(summary => {
                const change = changes.find(c => c.product_id === summary.product_id);
                const changeFormatted = change ? formatChange(change.change_pct) : null;
                const sparkData = getSparklineData(summary.product_id);

                return (
                  <tr
                    key={summary.product_id}
                    onClick={() => navigate(`/product/${summary.slug}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div style={{ fontWeight: 500 }}>{summary.name}</div>
                      {summary.subcategory && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {summary.subcategory} &middot; {summary.unit}
                        </div>
                      )}
                    </td>
                    <td className="price-cell">{formatNaira(summary.avg_price)}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {formatNaira(summary.min_price)} - {formatNaira(summary.max_price)}
                    </td>
                    <td className={`change-cell ${changeFormatted?.className || 'change-flat'}`}>
                      {changeFormatted?.text || '-'}
                    </td>
                    <td>
                      <Sparkline data={sparkData} color="auto" />
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{summary.data_points}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="product-listing-grid">
          {filteredSummaries.map(summary => {
            const change = changes.find(c => c.product_id === summary.product_id);
            const changeFormatted = change ? formatChange(change.change_pct) : null;

            return (
              <Link
                key={summary.product_id}
                to={`/product/${summary.slug}`}
                className="product-listing-card"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="product-listing-name">{summary.name}</div>
                <div className="product-listing-sub">
                  {summary.subcategory} &middot; {summary.unit}
                </div>
                <div className="product-listing-price">
                  {formatNaira(summary.avg_price)}
                </div>
                <div className="product-listing-range">
                  Range: {formatNaira(summary.min_price)} - {formatNaira(summary.max_price)}
                </div>
                <div className="product-listing-footer">
                  <span className={changeFormatted?.className || 'change-flat'} style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                    {changeFormatted?.text || 'No change'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {summary.data_points} sources
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
