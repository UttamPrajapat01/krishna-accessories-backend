import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Award } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 className="font-serif" style={{ fontSize: '18px', color: '#FFF' }}>Analytics & Financial Reports</h2>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Store velocity, average order value & category turnover</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Average Order Value</span>
          <h3 className="font-serif" style={{ fontSize: '24px', color: 'var(--gold-light)', marginTop: '8px' }}>₹42,995</h3>
          <p style={{ fontSize: '11px', color: 'var(--accent-success)', marginTop: '4px' }}>+18.4% luxury benchmark</p>
        </div>
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Top Selling Category</span>
          <h3 className="font-serif" style={{ fontSize: '24px', color: '#FFF', marginTop: '8px' }}>Watches</h3>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>74% of total turnover</p>
        </div>
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>COD vs Gateway</span>
          <h3 className="font-serif" style={{ fontSize: '24px', color: '#FFF', marginTop: '8px' }}>100% COD</h3>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Razorpay gateway standby</p>
        </div>
      </div>
    </div>
  );
};
