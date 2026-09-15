import React from 'react';
import { Settings, Shield, Server, Database, CreditCard } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div style={{ padding: '28px', maxWidth: '750px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 className="font-serif" style={{ fontSize: '18px', color: '#FFF' }}>System Configuration</h2>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Environment parameters & infrastructure status</p>
      </div>

      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Database size={20} color="var(--gold-primary)" />
          <div>
            <strong style={{ fontSize: '14px', color: '#FFF', display: 'block' }}>PostgreSQL 18.4 Database</strong>
            <span style={{ fontSize: '12px', color: 'var(--accent-success)' }}>Connected: KrishnaAccessoriesDB on localhost:5432</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Server size={20} color="var(--gold-primary)" />
          <div>
            <strong style={{ fontSize: '14px', color: '#FFF', display: 'block' }}>ASP.NET Core 8 Web API</strong>
            <span style={{ fontSize: '12px', color: 'var(--accent-success)' }}>Running on http://localhost:5070 (Swagger active)</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CreditCard size={20} color="var(--gold-primary)" />
          <div>
            <strong style={{ fontSize: '14px', color: '#FFF', display: 'block' }}>Razorpay Payment Engine</strong>
            <span style={{ fontSize: '12px', color: 'var(--gold-light)' }}>Test Mode Enabled (rzp_test_KRISHNA_DEV_KEY)</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Shield size={20} color="var(--gold-primary)" />
          <div>
            <strong style={{ fontSize: '14px', color: '#FFF', display: 'block' }}>JWT Security Layer</strong>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>HMAC-SHA256 Token Expiry: 120 minutes | Refresh Token: 30 days</span>
          </div>
        </div>
      </div>
    </div>
  );
};
