import React, { useEffect, useState } from 'react';
import { AlertTriangle, Check, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { InventoryItem } from '../types';

export const InventoryPage: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [newStock, setNewStock] = useState<{ [id: string]: number }>({});

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await api.get('/admin/inventory');
      if (res.data.success) {
        setInventory(res.data.data);
        const map: { [id: string]: number } = {};
        res.data.data.forEach((i: InventoryItem) => {
          map[i.productId] = i.quantityAvailable;
        });
        setNewStock(map);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (productId: string) => {
    setUpdatingId(productId);
    try {
      await api.put(`/admin/inventory/${productId}`, {
        quantityAvailable: newStock[productId],
        lowStockThreshold: 5
      });
      fetchInventory();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating stock');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="font-serif" style={{ fontSize: '18px', color: '#FFF' }}>Inventory Control</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Real-time stock levels & low-stock alerts</p>
        </div>
        <button onClick={fetchInventory} className="btn-secondary">
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

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
              <th style={{ padding: '14px 16px' }}>Available Stock</th>
              <th style={{ padding: '14px 16px' }}>Threshold</th>
              <th style={{ padding: '14px 16px' }}>Status</th>
              <th style={{ padding: '14px 16px' }}>Adjust Stock</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: '#FFF' }}>{item.productName}</td>
                <td style={{ padding: '12px 16px', color: 'var(--gold-light)' }}>{item.productSku}</td>
                <td style={{ padding: '12px 16px', fontSize: '15px', fontWeight: 700 }}>{item.quantityAvailable}</td>
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{item.lowStockThreshold}</td>
                <td style={{ padding: '12px 16px' }}>
                  {item.quantityAvailable <= item.lowStockThreshold ? (
                    <span className="badge badge-danger">Low Stock</span>
                  ) : (
                    <span className="badge badge-success">In Stock</span>
                  )}
                </td>
                <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    value={newStock[item.productId] ?? item.quantityAvailable}
                    onChange={e => setNewStock({ ...newStock, [item.productId]: Number(e.target.value) })}
                    className="input-field"
                    style={{ width: '80px', padding: '6px 10px' }}
                  />
                  <button
                    onClick={() => handleUpdate(item.productId)}
                    disabled={updatingId === item.productId}
                    className="btn-gold"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    {updatingId === item.productId ? 'Saving...' : 'Update'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
