import React, { useEffect, useState } from 'react';
import { Plus, Trash2, TicketPercent, X } from 'lucide-react';
import api from '../services/api';
import { Coupon } from '../types';

export const CouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('Percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minOrder, setMinOrder] = useState<number>(1000);
  const [maxDiscount, setMaxDiscount] = useState<number>(1500);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/admin/coupons');
      if (res.data.success) setCoupons(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/coupons', {
        code: code.toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        minimumOrderAmount: Number(minOrder),
        maxDiscountAmount: discountType === 'Percentage' ? Number(maxDiscount) : undefined,
        isActive: true
      });
      setIsModalOpen(false);
      fetchCoupons();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating coupon');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this coupon?')) {
      await api.delete(`/admin/coupons/${id}`);
      fetchCoupons();
    }
  };

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="font-serif" style={{ fontSize: '18px', color: '#FFF' }}>Promo & Discount Coupons</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Create luxury promotional codes for campaigns</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-gold">
          <Plus size={16} />
          <span>Create Coupon</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {coupons.map(c => (
          <div key={c.id} style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-gold)',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="font-serif gold-gradient-text" style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '1px' }}>
                  {c.code}
                </span>
                <span className="badge badge-gold">
                  {c.discountType === 'Percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Min. order: ₹{c.minimumOrderAmount} {c.maxDiscountAmount ? `| Max discount: ₹${c.maxDiscountAmount}` : ''}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--gold-light)', marginTop: '8px' }}>
                Redeemed: {c.usageCount} time(s)
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
              <button onClick={() => handleDelete(c.id)} style={{ background: 'none', border: 'none', color: '#FF453A', cursor: 'pointer' }}>
                <Trash2 size={16} />
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
              <h3 className="font-serif gold-gradient-text" style={{ fontSize: '18px' }}>Create Promo Code</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Code</label>
                <input required value={code} onChange={e => setCode(e.target.value)} className="input-field" placeholder="e.g. LUXURY20" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Discount Type</label>
                  <select value={discountType} onChange={e => setDiscountType(e.target.value)} className="input-field">
                    <option value="Percentage">Percentage (%)</option>
                    <option value="FixedAmount">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Discount Value</label>
                  <input type="number" required value={discountValue} onChange={e => setDiscountValue(Number(e.target.value))} className="input-field" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Min. Order (₹)</label>
                  <input type="number" required value={minOrder} onChange={e => setMinOrder(Number(e.target.value))} className="input-field" />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Max Discount (₹)</label>
                  <input type="number" value={maxDiscount} onChange={e => setMaxDiscount(Number(e.target.value))} className="input-field" />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-gold">Create Promo Code</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
