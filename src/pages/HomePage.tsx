import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import SearchBar from '../components/search/SearchBar';
import CategoryIcon from '../components/ui/CategoryIcon';
import Sparkline from '../components/ui/Sparkline';
import { fetchCategories, fetchPriceChanges, fetchProductSummaries, fetchLocations } from '../lib/api';
import { formatNaira, formatChange, formatRelativeTime } from '../lib/format';
import { pricePoints } from '../data/mockData';
import type { Category, PriceChange, ProductPriceSummary, Location } from '../types/database';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [priceChanges, setPriceChanges] = useState<PriceChange[]>([]);
  const [summaries, setSummaries] = useState<ProductPriceSummary[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories().then(setCategories);
    fetchPriceChanges(7, 15).then(setPriceChanges);
    fetchProductSummaries().then(setSummaries);
    fetchLocations(true).then(setLocations);
  }, []);

  // Get product count per category
  function getCategoryProductCount(categoryId: string): number {
    return summaries.filter(s => s.category_id === categoryId).length;
  }

  // Get mini sparkline data for a product
  function getSparklineData(productId: string): number[] {
    const points = pricePoints
      .filter(pp => pp.product_id === productId)
      .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
      .slice(-14);
    return points.map(p => p.price);
  }

  // Top trending items
  const trending = priceChanges.slice(0, 6);

  // Recent price changes for table
  const tableChanges = priceChanges.slice(0, 12);

  return (
    <div>
      {/* Hero + Search */}
      <section className="hero container">
        <h1>
          Track <span>Every Price</span> in Nigeria
        </h1>
        <p>
          Real-time price data for goods, commodities, and services across
          Nigerian markets. Search, compare, and stay informed.
        </p>
        <SearchBar large placeholder="Search for any product, commodity, or service..." />
      </section>

      {/* Category Grid */}
      <section className="section container">
        <div className="section-header">
          <h2 className="section-title">Browse Categories</h2>
        </div>
        <div className="category-grid">
          {categories.map(category => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="category-card"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <CategoryIcon icon={category.icon} color={category.color} />
              <div className="category-card-name">{category.name}</div>
              <div className="category-card-count">
                {getCategoryProductCount(category.id)} items tracked
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending / Most Volatile */}
      <section className="section container">
        <div className="section-header">
          <h2 className="section-title">Trending Now</h2>
          <Link to="/trends" className="section-link">
            View all trends <ArrowRight size={14} style={{ verticalAlign: 'middle' }} />
          </Link>
        </div>
        <div className="trending-grid">
          {trending.map(item => {
            const change = formatChange(item.change_pct);
            return (
              <Link
                key={item.product_id}
                to={`/product/${item.product_slug}`}
                className="trending-card"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="trending-card-name">
                  {item.change_pct > 0 ? (
                    <TrendingUp size={14} color="var(--green)" style={{ marginRight: 6 }} />
                  ) : (
                    <TrendingDown size={14} color="var(--red)" style={{ marginRight: 6 }} />
                  )}
                  {item.product_name}
                </div>
                <div className="trending-card-price">
                  {formatNaira(item.current_avg)}
                </div>
                <div className={`trending-card-change ${change.className}`}>
                  {change.text} this week
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Location Quick Access */}
      <section className="section container">
        <div className="section-header">
          <h2 className="section-title">Prices by Location</h2>
        </div>
        <div className="location-buttons">
          <button
            className={`location-btn ${selectedLocation === null ? 'active' : ''}`}
            onClick={() => setSelectedLocation(null)}
          >
            All Nigeria
          </button>
          {locations.map(loc => (
            <button
              key={loc.id}
              className={`location-btn ${selectedLocation === loc.id ? 'active' : ''}`}
              onClick={() => setSelectedLocation(loc.id === selectedLocation ? null : loc.id)}
            >
              {loc.name}
            </button>
          ))}
        </div>
      </section>

      {/* Recent Price Changes Table */}
      <section className="section container">
        <div className="section-header">
          <h2 className="section-title">Recent Price Changes</h2>
          <Link to="/trends" className="section-link">
            View all <ArrowRight size={14} style={{ verticalAlign: 'middle' }} />
          </Link>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Current Price</th>
                <th>Change (7d)</th>
                <th>Trend</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {tableChanges.map(item => {
                const change = formatChange(item.change_pct);
                const summary = summaries.find(s => s.product_id === item.product_id);
                const category = categories.find(c => c.id === item.category_id);
                const sparkData = getSparklineData(item.product_id);

                return (
                  <tr
                    key={item.product_id}
                    onClick={() => navigate(`/product/${item.product_slug}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ fontWeight: 500 }}>{item.product_name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{category?.name}</td>
                    <td className="price-cell">{formatNaira(item.current_avg)}</td>
                    <td className={`change-cell ${change.className}`}>{change.text}</td>
                    <td>
                      <Sparkline data={sparkData} color="auto" />
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {summary?.last_updated ? formatRelativeTime(summary.last_updated) : '-'}
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
