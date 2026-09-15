import React, { useEffect, useState } from 'react';
import { CreditCard, IndianRupee, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { Order } from '../types';

export const PaymentsPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    api.get('/admin/orders').then(res => {
      if (res.data.success) setOrders(res.data.data.items);
    });
  }, []);

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 className="font-serif" style={{ fontSize: '18px', color: '#FFF' }}>Payment Transactions</h2>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Payment gateway verification & COD settlement records</p>
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
              <th style={{ padding: '14px 16px' }}>Order Ref</th>
              <th style={{ padding: '14px 16px' }}>Client</th>
              <th style={{ padding: '14px 16px' }}>Gateway Method</th>
              <th style={{ padding: '14px 16px' }}>Amount</th>
              <th style={{ padding: '14px 16px' }}>Settlement Status</th>
              <th style={{ padding: '14px 16px' }}>Transaction Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--gold-light)' }}>{o.orderNumber}</td>
                <td style={{ padding: '12px 16px', color: '#FFF' }}>{o.customerName}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span className="badge badge-info">{o.paymentMethod}</span>
                </td>
                <td style={{ padding: '12px 16px', fontWeight: 700 }}>₹{o.totalAmount.toLocaleString('en-IN')}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span className={`badge ${o.paymentStatus === 'Captured' ? 'badge-success' : 'badge-warning'}`}>
                    {o.paymentStatus}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                  {new Date(o.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
