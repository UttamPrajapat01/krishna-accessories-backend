import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, X } from 'lucide-react';
import api from '../services/api';
import { Category } from '../types';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories?includeInactive=true');
      if (res.data.success) setCategories(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openCreate = () => {
    setEditingCat(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('');
    setIsModalOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditingCat(c);
    setName(c.name);
    setSlug(c.slug);
    setDescription(c.description || '');
    setImageUrl(c.imageUrl || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      description,
      imageUrl,
      isActive: true,
      displayOrder: editingCat ? editingCat.displayOrder : categories.length + 1
    };

    try {
      if (editingCat) {
        await api.put(`/categories/${editingCat.id}`, payload);
      } else {
        await api.post('/categories', payload);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving category');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await api.delete(`/categories/${id}`);
        fetchCategories();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Error deleting category');
      }
    }
  };

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="font-serif" style={{ fontSize: '18px', color: '#FFF' }}>Category Management</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Configure luxury product taxonomies</p>
        </div>
        <button onClick={openCreate} className="btn-gold">
          <Plus size={16} />
          <span>Add Category</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {categories.map(c => (
          <div key={c.id} style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ height: '140px', position: 'relative', overflow: 'hidden' }}>
              <img
                src={c.imageUrl || 'https://via.placeholder.com/300x140'}
                alt={c.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span className="badge badge-gold" style={{ position: 'absolute', top: '10px', right: '10px' }}>
                {c.productCount} Products
              </span>
            </div>
            <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 className="font-serif" style={{ fontSize: '16px', color: '#FFF' }}>{c.name}</h3>
                <p style={{ fontSize: '11px', color: 'var(--gold-light)', margin: '2px 0 6px' }}>/{c.slug}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>{c.description}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                <button onClick={() => openEdit(c)} className="btn-secondary" style={{ padding: '6px 10px', fontSize: '12px' }}>
                  <Edit2 size={14} />
                  <span>Edit</span>
                </button>
                <button onClick={() => handleDelete(c.id)} className="btn-secondary" style={{ padding: '6px 10px', fontSize: '12px', color: '#FF453A' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px'
        }}>
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-gold)', borderRadius: '16px', width: '100%', maxWidth: '480px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="font-serif gold-gradient-text" style={{ fontSize: '18px' }}>
                {editingCat ? 'Edit Category' : 'Create Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Category Name</label>
                <input required value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="e.g. Watches" />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>URL Slug</label>
                <input value={slug} onChange={e => setSlug(e.target.value)} className="input-field" placeholder="e.g. watches" />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Image URL</label>
                <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="input-field" placeholder="https://..." />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Description</label>
                <textarea rows={2} value={description} onChange={e => setDescription(e.target.value)} className="input-field" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-gold">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
