import { useState, useEffect, type FormEvent } from 'react';
import { Pencil, Trash2, Plus, X, Star } from 'lucide-react';
import {
  adminFetchProducts,
  adminFetchCategories,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
} from '../../lib/adminApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import type { Product, Category } from '../../types/database';

interface FormState {
  name: string;
  category_id: string;
  subcategory: string;
  unit: string;
  description: string;
  is_featured: boolean;
}

const emptyForm: FormState = { name: '', category_id: '', subcategory: '', unit: 'per unit', description: '', is_featured: false };

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([adminFetchProducts(), adminFetchCategories()]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    }
    setLoading(false);
  }

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm, category_id: categories[0]?.id || '' });
    setShowForm(true);
    setError('');
  }

  function openEdit(prod: Product) {
    setEditingId(prod.id);
    setForm({
      name: prod.name,
      category_id: prod.category_id,
      subcategory: prod.subcategory || '',
      unit: prod.unit,
      description: prod.description || '',
      is_featured: prod.is_featured,
    });
    setShowForm(true);
    setError('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editingId) {
        await adminUpdateProduct(editingId, form);
      } else {
        await adminCreateProduct(form);
      }
      setShowForm(false);
      setEditingId(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    }
    setSaving(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This will also delete all its price data.`)) return;
    try {
      await adminDeleteProduct(id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  const filteredProducts = filterCat === 'all' ? products : products.filter(p => p.category_id === filterCat);
  const getCatName = (id: string) => categories.find(c => c.id === id)?.name || '—';

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Products</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{products.length} products</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} style={{ marginRight: 6 }} /> Add Product
        </button>
      </div>

      {error && <div className="message message-error">{error}</div>}

      {/* Filter */}
      <div className="filter-bar">
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <h3 className="card-title">{editingId ? 'Edit Product' : 'New Product'}</h3>
            <button onClick={() => setShowForm(false)} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required maxLength={200} style={{ width: '100%' }} placeholder="e.g. Rice (50kg bag)" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Category *</label>
                <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} required style={{ width: '100%' }}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Sub-category</label>
                <input value={form.subcategory} onChange={e => setForm({ ...form, subcategory: e.target.value })} maxLength={100} style={{ width: '100%' }} placeholder="e.g. Grains" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Unit</label>
                <input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} maxLength={50} style={{ width: '100%' }} placeholder="e.g. per 50kg bag" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Description</label>
                <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} maxLength={500} style={{ width: '100%' }} placeholder="Optional description" />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  <input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} />
                  Featured product
                </label>
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 12 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Sub-category</th>
              <th>Unit</th>
              <th>Featured</th>
              <th>Views</th>
              <th style={{ width: 100 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(prod => (
              <tr key={prod.id}>
                <td style={{ fontWeight: 500 }}>{prod.name}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{getCatName(prod.category_id)}</td>
                <td style={{ color: 'var(--text-muted)' }}>{prod.subcategory || '—'}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{prod.unit}</td>
                <td>{prod.is_featured ? <Star size={16} color="var(--yellow)" fill="var(--yellow)" /> : '—'}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{prod.view_count.toLocaleString()}</td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => openEdit(prod)} style={{ color: 'var(--blue)', padding: 4 }} title="Edit"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(prod.id, prod.name)} style={{ color: 'var(--red)', padding: 4 }} title="Delete"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
