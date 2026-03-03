import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, Bell, Check, ExternalLink } from 'lucide-react';
import {
  fetchProductBySlug,
  fetchLatestPrices,
  fetchPriceChanges,
  fetchCategories,
  incrementViewCount,
} from '../lib/api';
import { formatNaira, formatNairaFull, formatChange, formatRelativeTime } from '../lib/format';
import PriceHistoryChart from '../components/charts/PriceHistoryChart';
import PriceAlertForm from '../components/ui/PriceAlertForm';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import type { Product, LatestPrice, PriceChange, Category } from '../types/database';

interface ProductPageProps {
  onAddCompare?: (productId: string) => void;
  isInCompare?: (productId: string) => boolean;
}

export default function ProductPage({ onAddCompare, isInCompare }: ProductPageProps) {
  const { slug } = useParams<{ slug: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [prices, setPrices] = useState<LatestPrice[]>([]);
  const [changes, setChanges] = useState<PriceChange[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [sortColumn, setSortColumn] = useState<'location' | 'price' | 'change'>('price');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    fetchProductBySlug(slug).then(prod => {
      setProduct(prod);
      if (prod) {
        incrementViewCount(prod.id);
        Promise.all([
          fetchLatestPrices(prod.id),
          fetchPriceChanges(7, 50),
          fetchCategories(),
        ]).then(([p, c, cats]) => {
          setPrices(p);
          setChanges(c);
          setCategories(cats);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
  }, [slug]);

  const productChange = useMemo(() => {
    if (!product) return null;
    return changes.find(c => c.product_id === product.id) || null;
  }, [product, changes]);

  const avgPrice = useMemo(() => {
    if (prices.length === 0) return 0;
    return prices.reduce((sum, p) => sum + p.price, 0) / prices.length;
  }, [prices]);

  const sortedPrices = useMemo(() => {
    const sorted = [...prices];
    sorted.sort((a, b) => {
      let cmp = 0;
      if (sortColumn === 'location') cmp = a.location_name.localeCompare(b.location_name);
      if (sortColumn === 'price') cmp = a.price - b.price;
      return sortDirection === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [prices, sortColumn, sortDirection]);

  function handleSort(col: typeof sortColumn) {
    if (sortColumn === col) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  }

  if (loading) return <LoadingSpinner />;

  if (!product) {
    return (
      <div className="container">
        <div className="empty-state" style={{ paddingTop: 80 }}>
          <h3>Product not found</h3>
          <p>The product you're looking for doesn't exist.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-block' }}>
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const category = categories.find(c => c.id === product.category_id);
  const changeFormatted = productChange ? formatChange(productChange.change_pct) : null;
  const inCompare = isInCompare?.(product.id) || false;

  return (
    <div className="container">
      {/* Breadcrumb + Header */}
      <div className="product-header">
        <div className="product-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          {category && (
            <>
              <Link to={`/category/${category.slug}`}>{category.name}</Link>
              <span>/</span>
            </>
          )}
          <span>{product.name}</span>
        </div>

        <h1 className="product-title">{product.name}</h1>

        <div className="product-meta">
          <span className="product-price-large">{formatNaira(avgPrice)}</span>
          {changeFormatted && (
            <span
              className={`product-change-large ${changeFormatted.className}`}
              style={{
                background: productChange!.change_pct > 0
                  ? 'var(--green-bg)' : productChange!.change_pct < 0
                  ? 'var(--red-bg)' : 'transparent',
              }}
            >
              {changeFormatted.text}
            </span>
          )}
          <span className="product-updated">
            {product.unit} &middot; National average &middot; {prices.length} locations
          </span>
        </div>
      </div>

      <div className="product-grid">
        {/* Main Content */}
        <div className="product-main">
          {/* Price History Chart */}
          <div className="card">
            <PriceHistoryChart productId={product.id} />
          </div>

          {/* Price by Location Table */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Price by Location</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {prices.length} locations
              </span>
            </div>
            <div className="data-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('location')} style={{ cursor: 'pointer' }}>
                      Location {sortColumn === 'location' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th onClick={() => handleSort('price')} style={{ cursor: 'pointer' }}>
                      Price {sortColumn === 'price' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th>vs National Avg</th>
                    <th>Source</th>
                    <th>Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPrices.map(price => {
                    const diff = avgPrice > 0
                      ? ((price.price - avgPrice) / avgPrice) * 100
                      : 0;
                    const diffFormatted = formatChange(diff);

                    return (
                      <tr key={price.id}>
                        <td>
                          <div style={{ fontWeight: 500 }}>{price.location_name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {price.state}, {price.region}
                          </div>
                        </td>
                        <td className="price-cell">{formatNairaFull(price.price)}</td>
                        <td className={`change-cell ${diffFormatted.className}`}>
                          {diffFormatted.text}
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'capitalize' }}>
                          {price.source.replace('_', ' ')}
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          {formatRelativeTime(price.recorded_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="product-sidebar">
          {/* Actions */}
          <div className="card">
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                className="btn btn-primary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                onClick={() => onAddCompare?.(product.id)}
                disabled={inCompare}
              >
                {inCompare ? <Check size={16} /> : <Plus size={16} />}
                {inCompare ? 'Added to Compare' : 'Add to Compare'}
              </button>
              <button
                className="btn btn-secondary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                onClick={() => setShowAlert(!showAlert)}
              >
                <Bell size={16} />
                {showAlert ? 'Hide Alert Form' : 'Set Price Alert'}
              </button>
            </div>
          </div>

          {/* Alert Form */}
          {showAlert && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Price Alert</h3>
              </div>
              <PriceAlertForm productId={product.id} />
            </div>
          )}

          {/* Product Info */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Product Details</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Category</div>
                  <div>{category?.name}</div>
                </div>
                {product.subcategory && (
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sub-category</div>
                    <div>{product.subcategory}</div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Unit</div>
                  <div>{product.unit}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Price Range</div>
                  <div style={{ fontFamily: 'var(--font-mono)' }}>
                    {prices.length > 0
                      ? `${formatNaira(Math.min(...prices.map(p => p.price)))} - ${formatNaira(Math.max(...prices.map(p => p.price)))}`
                      : 'No data'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Views</div>
                  <div>{product.view_count.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Sources */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Data Sources</h3>
            </div>
            <div className="card-body">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                Price data for this product is sourced from:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Array.from(new Set(prices.map(p => p.source))).map(source => (
                  <div
                    key={source}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: '0.85rem',
                      textTransform: 'capitalize',
                    }}
                  >
                    <ExternalLink size={14} color="var(--text-muted)" />
                    {source.replace('_', ' ')}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
