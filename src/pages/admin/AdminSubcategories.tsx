import { useState, useEffect, type FormEvent } from 'react';
import { Pencil, Trash2, Plus, X } from 'lucide-react';
import {
  adminFetchSubcategories, adminCreateSubcategory, adminUpdateSubcategory, adminDeleteSubcategory,
  adminFetchCategories,
} from '../../lib/adminApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import type { Category, Subcategory } from '../../types/database';

interface FormState { name: string; category_id: string; description: string; display_order: number; }
const emptyForm: FormState = { name: '', category_id: '', description: '', display_order: 0 };

export default function AdminSubcategories() {
  const [subcategories, setSubcategories] = useState<(Subcategory & { category_name?: string })[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [subs, cats] = await Promise.all([adminFetchSubcategories(), adminFetchCategories()]);
      setSubcategories(subs);
      setCategories(cats);
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to load'); }
    setLoading(false);
  }

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm, display_order: subcategories.length + 1 });
    setShowForm(true); setError('');
  }
  function openEdit(sub: Subcategory) {
    setEditingId(sub.id);
    setForm({ name: sub.name, category_id: sub.category_id, description: sub.description || '', display_order: sub.display_order });
    setShowForm(true); setError('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      if (editingId) await adminUpdateSubcategory(editingId, form);
      else await adminCreateSubcategory(form);
      setShowForm(false); setEditingId(null); await loadData();
    } catch (err) { setError(err instanceof Error ? err.message : 'Operation failed'); }
    setSaving(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete subcategory "${name}"? Products under this subcategory will be unlinked.`)) return;
    try { await adminDeleteSubcategory(id); await loadData(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Delete failed'); }
  }

  const filtered = filterCategory === 'all'
    ? subcategories
    : subcategories.filter(s => s.category_id === filterCategory);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Subcategories</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{subcategories.length} subcategories across {categories.length} categories</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} style={{ marginRight: 6 }} /> Add Subcategory</button>
      </div>

      {error && <div className="message message-error">{error}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <h3 className="card-title">{editingId ? 'Edit Subcategory' : 'New Subcategory'}</h3>
            <button onClick={() => setShowForm(false)} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Parent Category</label>
                <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} required style={{ width: '100%' }}>
                  <option value="">Select a category...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required maxLength={100} style={{ width: '100%' }} placeholder="e.g. Mobile Phones" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Description</label>
                <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} maxLength={500} style={{ width: '100%' }} placeholder="Brief description" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Display Order</label>
                <input type="number" value={form.display_order} onChange={e => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} min={0} style={{ width: 120 }} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update' : 'Create'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Category</th><th>Slug</th><th>Description</th><th>Order</th><th style={{ width: 100 }}>Actions</th></tr></thead>
          <tbody>
            {filtered.map(sub => (
              <tr key={sub.id}>
                <td style={{ fontWeight: 600 }}>{sub.name}</td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{sub.category_name || '—'}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>{sub.slug}</td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.description || '—'}</td>
                <td>{sub.display_order}</td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => openEdit(sub)} style={{ color: 'var(--blue)', padding: 4 }} title="Edit"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(sub.id, sub.name)} style={{ color: 'var(--red)', padding: 4 }} title="Delete"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No subcategories found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
