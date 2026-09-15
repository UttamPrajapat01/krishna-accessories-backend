import React from 'react';
import { Bell, ShieldCheck, User } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab }) => {
  const user = JSON.parse(localStorage.getItem('krishna_admin_user') || '{"fullName":"Krishna Admin"}');

  return (
    <header style={{
      height: '64px',
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h2 style={{ fontSize: '18px', textTransform: 'capitalize', fontWeight: 600, color: '#FFF' }}>
          {currentTab}
        </h2>
        <span className="badge badge-gold" style={{ fontSize: '10px', textTransform: 'uppercase' }}>
          Live API
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
          <ShieldCheck size={16} color="var(--gold-primary)" />
          <span>Role: <strong style={{ color: '#FFF' }}>Super Admin</strong></span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--gold-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--gold-light)'
          }}>
            <User size={18} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFF' }}>{user.fullName}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user.email || 'admin@krishnaaccessories.com'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
