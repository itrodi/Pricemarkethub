import { useState, useEffect, type FormEvent } from 'react';
import { Pencil, Trash2, Plus, X } from 'lucide-react';
import {
  adminFetchCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory,
} from '../../lib/adminApi';
import CategoryIcon from '../../components/ui/CategoryIcon';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import type { Category } from '../../types/database';

const ICON_OPTIONS = ['wheat', 'fuel', 'smartphone', 'banknote', 'building', 'car', 'utensils', 'gem', 'package', 'zap', 'shirt', 'pill'];
const COLOR_OPTIONS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#64748b', '#ef4444', '#84cc16'];

interface FormState { name: string; icon: string; description: string; color: string; display_order: number; }
const emptyForm: FormState = { name: '', icon: 'package', description: '', color: '#10b981', display_order: 0 };

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadCategories(); }, []);

  async function loadCategories() {
    setLoading(true);
    try { setCategories(await adminFetchCategories()); }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed to load'); }
    setLoading(false);
  }

  function openCreate() { setEditingId(null); setForm({ ...emptyForm, display_order: categories.length + 1 }); setShowForm(true); setError(''); }
  function openEdit(cat: Category) {
    setEditingId(cat.id);
    setForm({ name: cat.name, icon: cat.icon, description: cat.description || '', color: cat.color, display_order: cat.display_order });
    setShowForm(true); setError('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      if (editingId) await adminUpdateCategory(editingId, form);
      else await adminCreateCategory(form);
      setShowForm(false); setEditingId(null); await loadCategories();
    } catch (err) { setError(err instanceof Error ? err.message : 'Operation failed'); }
    setSaving(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete category "${name}"? This will also delete all its products and price data.`)) return;
    try { await adminDeleteCategory(id); await loadCategories(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Delete failed'); }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Categories</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{categories.length} categories</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} style={{ marginRight: 6 }} /> Add Category</button>
      </div>

      {error && <div className="message message-error">{error}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <h3 className="card-title">{editingId ? 'Edit Category' : 'New Category'}</h3>
            <button onClick={() => setShowForm(false)} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required maxLength={100} style={{ width: '100%' }} placeholder="e.g. Agriculture" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Description</label>
                <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} maxLength={500} style={{ width: '100%' }} placeholder="Brief description" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Icon</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {ICON_OPTIONS.map(icon => (
                    <button key={icon} type="button" onClick={() => setForm({ ...form, icon })}
                      style={{ padding: 8, borderRadius: 8, border: `2px solid ${form.icon === icon ? form.color : 'var(--border-primary)'}`, background: form.icon === icon ? `${form.color}15` : 'transparent' }}>
                      <CategoryIcon icon={icon} color={form.icon === icon ? form.color : 'var(--text-muted)'} size={20} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Color</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {COLOR_OPTIONS.map(color => (
                    <button key={color} type="button" onClick={() => setForm({ ...form, color })}
                      style={{ width: 32, height: 32, borderRadius: 8, background: color, border: `3px solid ${form.color === color ? 'var(--text-primary)' : 'transparent'}` }} />
                  ))}
                </div>
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

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead><tr><th>Icon</th><th>Name</th><th>Slug</th><th>Description</th><th>Order</th><th style={{ width: 100 }}>Actions</th></tr></thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat.id}>
                <td><CategoryIcon icon={cat.icon} color={cat.color} size={20} /></td>
                <td style={{ fontWeight: 600 }}>{cat.name}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>{cat.slug}</td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.description || '—'}</td>
                <td>{cat.display_order}</td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => openEdit(cat)} style={{ color: 'var(--blue)', padding: 4 }} title="Edit"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(cat.id, cat.name)} style={{ color: 'var(--red)', padding: 4 }} title="Delete"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No categories yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
