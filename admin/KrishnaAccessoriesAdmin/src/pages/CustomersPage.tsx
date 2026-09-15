import React, { useEffect, useState } from 'react';
import { Users, Mail, Phone, Calendar } from 'lucide-react';
import api from '../services/api';
import { User } from '../types';

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/admin/customers');
      if (res.data.success) setCustomers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 className="font-serif" style={{ fontSize: '18px', color: '#FFF' }}>Clientele Directory</h2>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Registered customer accounts and purchase history</p>
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
              <th style={{ padding: '14px 16px' }}>Full Name</th>
              <th style={{ padding: '14px 16px' }}>Email Address</th>
              <th style={{ padding: '14px 16px' }}>Phone Number</th>
              <th style={{ padding: '14px 16px' }}>Member Since</th>
              <th style={{ padding: '14px 16px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: '#FFF' }}>{c.fullName}</td>
                <td style={{ padding: '12px 16px', color: 'var(--gold-light)' }}>{c.email}</td>
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{c.phoneNumber || '—'}</td>
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span className={`badge ${c.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
