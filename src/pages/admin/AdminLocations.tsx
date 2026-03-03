import { useState, useEffect, type FormEvent } from 'react';
import { Trash2, Plus, X, MapPin } from 'lucide-react';
import { adminFetchLocations, adminCreateLocation, adminDeleteLocation } from '../../lib/adminApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import type { Location } from '../../types/database';

const REGIONS = ['South West', 'South East', 'South South', 'North Central', 'North East', 'North West'];

interface FormState {
  name: string;
  state: string;
  region: string;
  location_type: Location['location_type'];
  is_major: boolean;
}

const emptyForm: FormState = { name: '', state: '', region: 'South West', location_type: 'city', is_major: false };

export default function AdminLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadLocations(); }, []);

  async function loadLocations() {
    setLoading(true);
    try { setLocations(await adminFetchLocations()); }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed to load'); }
    setLoading(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await adminCreateLocation(form);
      setShowForm(false);
      setForm(emptyForm);
      await loadLocations();
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to create'); }
    setSaving(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete location "${name}"? Price data linked to this location will also be deleted.`)) return;
    try { await adminDeleteLocation(id); await loadLocations(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Delete failed'); }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Locations</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{locations.length} locations</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setError(''); }}>
          <Plus size={16} style={{ marginRight: 6 }} /> Add Location
        </button>
      </div>

      {error && <div className="message message-error">{error}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <h3 className="card-title">New Location</h3>
            <button onClick={() => setShowForm(false)} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>City / Market Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required maxLength={100} style={{ width: '100%' }} placeholder="e.g. Onitsha" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>State *</label>
                <input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} required maxLength={50} style={{ width: '100%' }} placeholder="e.g. Anambra" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Region</label>
                <select value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} style={{ width: '100%' }}>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Type</label>
                <select value={form.location_type} onChange={e => setForm({ ...form, location_type: e.target.value as Location['location_type'] })} style={{ width: '100%' }}>
                  <option value="city">City</option>
                  <option value="market">Market</option>
                  <option value="online">Online</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  <input type="checkbox" checked={form.is_major} onChange={e => setForm({ ...form, is_major: e.target.checked })} />
                  Major location (shown in quick-access)
                </label>
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 12 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Create Location'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>State</th>
              <th>Region</th>
              <th>Type</th>
              <th>Major</th>
              <th style={{ width: 60 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {locations.map(loc => (
              <tr key={loc.id}>
                <td style={{ fontWeight: 500 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MapPin size={14} color="var(--text-muted)" /> {loc.name}
                  </span>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{loc.state}</td>
                <td style={{ color: 'var(--text-muted)' }}>{loc.region}</td>
                <td><span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>{loc.location_type}</span></td>
                <td>{loc.is_major ? <span className="badge badge-green">Major</span> : '—'}</td>
                <td>
                  <button onClick={() => handleDelete(loc.id, loc.name)} style={{ color: 'var(--red)', padding: 4 }} title="Delete"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {locations.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No locations yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
