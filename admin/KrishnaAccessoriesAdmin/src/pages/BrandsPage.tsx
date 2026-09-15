import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, X } from 'lucide-react';
import api from '../services/api';
import { Brand } from '../types';

export const BrandsPage: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const res = await api.get('/brands?includeInactive=true');
      if (res.data.success) setBrands(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openCreate = () => {
    setEditingBrand(null);
    setName('');
    setSlug('');
    setDescription('');
    setLogoUrl('');
    setIsModalOpen(true);
  };

  const openEdit = (b: Brand) => {
    setEditingBrand(b);
    setName(b.name);
    setSlug(b.slug);
    setDescription(b.description || '');
    setLogoUrl(b.logoUrl || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      description,
      logoUrl,
      isActive: true
    };

    try {
      if (editingBrand) {
        await api.put(`/brands/${editingBrand.id}`, payload);
      } else {
        await api.post('/brands', payload);
      }
      setIsModalOpen(false);
      fetchBrands();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving brand');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this brand?')) {
      try {
        await api.delete(`/brands/${id}`);
        fetchBrands();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Error deleting brand');
      }
    }
  };

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="font-serif" style={{ fontSize: '18px', color: '#FFF' }}>Brand Directory</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Manage luxury brand partners</p>
        </div>
        <button onClick={openCreate} className="btn-gold">
          <Plus size={16} />
          <span>Add Brand</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        {brands.map(b => (
          <div key={b.id} style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="font-serif" style={{ fontSize: '16px', color: '#FFF' }}>{b.name}</h3>
                <span className="badge badge-gold" style={{ fontSize: '11px' }}>{b.productCount} items</span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--gold-light)', margin: '2px 0 6px' }}>@{b.slug}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{b.description || 'Luxury accessories brand partner'}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
              <button onClick={() => openEdit(b)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }}>
                <Edit2 size={12} />
                <span>Edit</span>
              </button>
              <button onClick={() => handleDelete(b.id)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', color: '#FF453A' }}>
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px'
        }}>
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-gold)', borderRadius: '16px', width: '100%', maxWidth: '440px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="font-serif gold-gradient-text" style={{ fontSize: '18px' }}>
                {editingBrand ? 'Edit Brand' : 'Add Brand'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Brand Name</label>
                <input required value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="e.g. Titan" />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Slug</label>
                <input value={slug} onChange={e => setSlug(e.target.value)} className="input-field" placeholder="e.g. titan" />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Description</label>
                <textarea rows={2} value={description} onChange={e => setDescription(e.target.value)} className="input-field" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-gold">Save Brand</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
