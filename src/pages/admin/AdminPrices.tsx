import { useState, useEffect, type FormEvent } from 'react';
import { Plus, X } from 'lucide-react';
import {
  adminFetchPricePoints,
  adminFetchProducts,
  adminFetchLocations,
  adminCreatePricePoint,
} from '../../lib/adminApi';
import { formatNairaFull, formatRelativeTime } from '../../lib/format';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import type { Product, Location, PricePoint } from '../../types/database';

const SOURCES: PricePoint['source'][] = ['market_survey', 'jumia', 'konga', 'jiji', 'nbs', 'cbn', 'nnpc', 'user_report'];

interface FormState {
  product_id: string;
  location_id: string;
  price: string;
  source: PricePoint['source'];
}

const emptyForm: FormState = { product_id: '', location_id: '', price: '', source: 'market_survey' };

export default function AdminPrices() {
  const [pricePoints, setPricePoints] = useState<(PricePoint & { product_name?: string; location_name?: string })[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  // Filters
  const [filterProduct, setFilterProduct] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [prods, locs] = await Promise.all([adminFetchProducts(), adminFetchLocations()]);
      setProducts(prods);
      setLocations(locs);
      const pp = await adminFetchPricePoints({ limit: 200 });
      setPricePoints(pp);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    }
    setLoading(false);
  }

  async function loadPrices() {
    const filters: { product_id?: string; location_id?: string; limit?: number } = { limit: 200 };
    if (filterProduct !== 'all') filters.product_id = filterProduct;
    if (filterLocation !== 'all') filters.location_id = filterLocation;
    try {
      setPricePoints(await adminFetchPricePoints(filters));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prices');
    }
  }

  useEffect(() => {
    if (!loading) loadPrices();
  }, [filterProduct, filterLocation]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await adminCreatePricePoint({
        product_id: form.product_id,
        location_id: form.location_id,
        price: parseFloat(form.price),
        source: form.source,
      });
      setSuccess('Price point added successfully.');
      setForm(emptyForm);
      await loadPrices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add price');
    }
    setSaving(false);
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Price Points</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Showing latest {pricePoints.length} entries</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setError(''); setSuccess(''); }}>
          <Plus size={16} style={{ marginRight: 6 }} /> Add Price Point
        </button>
      </div>

      {error && <div className="message message-error">{error}</div>}
      {success && <div className="message message-success">{success}</div>}

      {/* Add Price Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <h3 className="card-title">New Price Point</h3>
            <button onClick={() => setShowForm(false)} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Product *</label>
                <select value={form.product_id} onChange={e => setForm({ ...form, product_id: e.target.value })} required style={{ width: '100%' }}>
                  <option value="">Select product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Location *</label>
                <select value={form.location_id} onChange={e => setForm({ ...form, location_id: e.target.value })} required style={{ width: '100%' }}>
                  <option value="">Select location</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name} ({l.state})</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Price (NGN) *</label>
                <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required min="0.01" step="0.01" style={{ width: '100%' }} placeholder="e.g. 75000" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Source</label>
                <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value as PricePoint['source'] })} style={{ width: '100%' }}>
                  {SOURCES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 12 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Adding...' : 'Add Price Point'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filter-bar">
        <select value={filterProduct} onChange={e => setFilterProduct(e.target.value)}>
          <option value="all">All Products</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={filterLocation} onChange={e => setFilterLocation(e.target.value)}>
          <option value="all">All Locations</option>
          {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Location</th>
              <th>Price</th>
              <th>Source</th>
              <th>Verified</th>
              <th>Recorded At</th>
            </tr>
          </thead>
          <tbody>
            {pricePoints.map(pp => (
              <tr key={pp.id}>
                <td style={{ fontWeight: 500 }}>{pp.product_name || pp.product_id}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{pp.location_name || pp.location_id}</td>
                <td className="price-cell">{formatNairaFull(pp.price)}</td>
                <td><span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>{pp.source}</span></td>
                <td>{pp.verified ? <span className="badge badge-green">Yes</span> : <span style={{ color: 'var(--text-muted)' }}>No</span>}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{formatRelativeTime(pp.recorded_at)}</td>
              </tr>
            ))}
            {pricePoints.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No price points found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
