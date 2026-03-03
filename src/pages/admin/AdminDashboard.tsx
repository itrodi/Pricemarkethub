import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FolderTree, Package, MapPin, DollarSign, Bell, TrendingUp } from 'lucide-react';
import { fetchAdminStats, type AdminStats } from '../../lib/adminApi';
import { formatNumber } from '../../lib/format';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const statCards = [
    { label: 'Categories', value: stats?.totalCategories || 0, icon: FolderTree, color: 'var(--green)', link: '/admin/categories' },
    { label: 'Products', value: stats?.totalProducts || 0, icon: Package, color: 'var(--blue)', link: '/admin/products' },
    { label: 'Locations', value: stats?.totalLocations || 0, icon: MapPin, color: 'var(--purple)', link: '/admin/locations' },
    { label: 'Price Points', value: stats?.totalPricePoints || 0, icon: DollarSign, color: 'var(--yellow)', link: '/admin/prices' },
    { label: 'Alerts', value: stats?.totalAlerts || 0, icon: Bell, color: 'var(--orange)', link: '/admin/prices' },
    { label: "Today's Prices", value: stats?.recentPricePoints || 0, icon: TrendingUp, color: 'var(--cyan)', link: '/admin/prices' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: 4 }}>Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Overview of your PriceWise data</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {statCards.map(card => (
          <Link key={card.label} to={card.link} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 12, padding: 20, textDecoration: 'none', color: 'inherit' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <card.icon size={20} color={card.color} />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{formatNumber(card.value)}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>{card.label}</div>
          </Link>
        ))}
      </div>

      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 16 }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/admin/products" className="btn btn-primary" style={{ textDecoration: 'none' }}>+ Add Product</Link>
          <Link to="/admin/prices" className="btn btn-primary" style={{ textDecoration: 'none', background: 'var(--blue)' }}>+ Add Price Point</Link>
          <Link to="/admin/import" className="btn btn-secondary" style={{ textDecoration: 'none' }}>Import CSV</Link>
          <Link to="/admin/scraper" className="btn btn-secondary" style={{ textDecoration: 'none' }}>Run Scraper</Link>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">Getting Started</h3></div>
        <div className="card-body" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.8 }}>
          <p style={{ marginBottom: 12 }}><strong>1. Add Categories</strong> &mdash; Create the product categories you want to track.</p>
          <p style={{ marginBottom: 12 }}><strong>2. Add Locations</strong> &mdash; Set up the Nigerian cities and markets.</p>
          <p style={{ marginBottom: 12 }}><strong>3. Add Products</strong> &mdash; Create specific products under each category.</p>
          <p style={{ marginBottom: 12 }}><strong>4. Add Price Data</strong> &mdash; Enter prices manually, import via CSV, or use the scraper.</p>
          <p><strong>5. Scraper</strong> &mdash; Set up automated scrapers for Jumia, Konga, and Jiji.</p>
        </div>
      </div>
    </div>
  );
}
