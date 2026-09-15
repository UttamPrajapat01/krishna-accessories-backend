import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Check, X, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';
import { Product, Category, Brand } from '../types';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [mrp, setMrp] = useState<number>(0);
  const [stock, setStock] = useState<number>(10);
  const [imageUrl, setImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pRes, cRes, bRes] = await Promise.all([
        api.get('/products?pageSize=100'),
        api.get('/categories'),
        api.get('/brands')
      ]);
      if (pRes.data.success) setProducts(pRes.data.data.items);
      if (cRes.data.success) {
        setCategories(cRes.data.data);
        if (cRes.data.data.length > 0) setCategoryId(cRes.data.data[0].id);
      }
      if (bRes.data.success) {
        setBrands(bRes.data.data);
        if (bRes.data.data.length > 0) setBrandId(bRes.data.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setSku(`KA-${Math.floor(1000 + Math.random() * 9000)}`);
    setDescription('');
    setShortDesc('');
    setPrice(4999);
    setMrp(6999);
    setStock(15);
    setImageUrl('https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80');
    setIsFeatured(false);
    setIsBestSeller(false);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSku(p.sku);
    setDescription(p.description);
    setShortDesc(p.shortDescription || '');
    setCategoryId(p.categoryId);
    setBrandId(p.brandId);
    setPrice(p.price);
    setMrp(p.mrp);
    setStock(p.stockQuantity);
    setImageUrl(p.mainImageUrl || '');
    setIsFeatured(p.isFeatured);
    setIsBestSeller(p.isBestSeller);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
    const payload = {
      name,
      sku,
      description,
      shortDescription: shortDesc,
      categoryId,
      brandId,
      price: Number(price),
      mrp: Number(mrp),
      discount,
      stockQuantity: Number(stock),
      isActive: true,
      isFeatured,
      isBestSeller,
      imageUrls: imageUrl ? [imageUrl] : []
    };

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving product');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to deactivate this product?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchData();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Error deleting product');
      }
    }
  };

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !selectedCategory || p.categoryId === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              placeholder="Search by title or SKU..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '36px' }}
            />
          </div>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="input-field"
            style={{ width: '180px' }}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <button onClick={openCreateModal} className="btn-gold">
          <Plus size={16} />
          <span>Add Luxury Item</span>
        </button>
      </div>

      {/* Products Table */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ padding: '14px 16px' }}>Product</th>
              <th style={{ padding: '14px 16px' }}>SKU</th>
              <th style={{ padding: '14px 16px' }}>Category</th>
              <th style={{ padding: '14px 16px' }}>Brand</th>
              <th style={{ padding: '14px 16px' }}>Price / MRP</th>
              <th style={{ padding: '14px 16px' }}>Stock</th>
              <th style={{ padding: '14px 16px' }}>Badges</th>
              <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={p.mainImageUrl || 'https://via.placeholder.com/44'}
                    alt={p.name}
                    style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '6px' }}
                  />
                  <div>
                    <span style={{ fontWeight: 600, color: '#FFF', display: 'block' }}>{p.name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>⭐ {p.averageRating} ({p.reviewCount} reviews)</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--gold-light)' }}>{p.sku}</td>
                <td style={{ padding: '12px 16px' }}>{p.categoryName}</td>
                <td style={{ padding: '12px 16px' }}>{p.brandName}</td>
                <td style={{ padding: '12px 16px' }}>
                  <strong style={{ color: '#FFF' }}>₹{p.price.toLocaleString('en-IN')}</strong>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: '6px' }}>
                    ₹{p.mrp.toLocaleString('en-IN')}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span className={`badge ${p.stockQuantity <= 5 ? 'badge-danger' : 'badge-success'}`}>
                    {p.stockQuantity} in stock
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {p.isFeatured && <span className="badge badge-gold" style={{ marginRight: '4px' }}>Featured</span>}
                  {p.isBestSeller && <span className="badge badge-info">Best Seller</span>}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <button onClick={() => openEditModal(p)} style={{ background: 'none', border: 'none', color: 'var(--gold-primary)', cursor: 'pointer', marginRight: '10px' }}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', color: '#FF453A', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-gold)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="font-serif gold-gradient-text" style={{ fontSize: '20px', fontWeight: 700 }}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Title</label>
                <input required value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="e.g. Titan Regalia Sovereign" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>SKU</label>
                  <input required value={sku} onChange={e => setSku(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Stock Quantity</label>
                  <input type="number" required value={stock} onChange={e => setStock(Number(e.target.value))} className="input-field" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Category</label>
                  <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="input-field">
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Brand</label>
                  <select value={brandId} onChange={e => setBrandId(e.target.value)} className="input-field">
                    {brands.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Selling Price (₹)</label>
                  <input type="number" required value={price} onChange={e => setPrice(Number(e.target.value))} className="input-field" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>MRP (₹)</label>
                  <input type="number" required value={mrp} onChange={e => setMrp(Number(e.target.value))} className="input-field" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Image URL</label>
                <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="input-field" placeholder="https://..." />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Short Description</label>
                <input value={shortDesc} onChange={e => setShortDesc(e.target.value)} className="input-field" placeholder="One sentence highlight" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Full Description</label>
                <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="input-field" placeholder="Detailed product specifications..." />
              </div>

              <div style={{ display: 'flex', gap: '20px', marginTop: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                  <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} />
                  <span>Featured Product</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                  <input type="checkbox" checked={isBestSeller} onChange={e => setIsBestSeller(e.target.checked)} />
                  <span>Best Seller</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-gold">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
