import React from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  Sparkles,
  Boxes,
  ShoppingBag,
  Users,
  CreditCard,
  TicketPercent,
  Star,
  Bell,
  BarChart3,
  Settings,
  LogOut,
  Gem
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'brands', label: 'Brands', icon: Sparkles },
    { id: 'inventory', label: 'Inventory', icon: Boxes },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'coupons', label: 'Coupons', icon: TicketPercent },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0
    }}>
      {/* Brand Header */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #D4AF37 0%, #996515 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0A0A0D'
        }}>
          <Gem size={22} />
        </div>
        <div>
          <h1 className="font-serif gold-gradient-text" style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '0.5px' }}>
            KRISHNA
          </h1>
          <p style={{ fontSize: '10px', color: 'var(--gold-light)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            Accessories Admin
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isActive ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                color: isActive ? 'var(--gold-light)' : 'var(--text-muted)',
                fontWeight: isActive ? 600 : 400,
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease',
                borderLeft: isActive ? '3px solid var(--gold-primary)' : '3px solid transparent'
              }}
            >
              <Icon size={18} color={isActive ? 'var(--gold-primary)' : 'var(--text-muted)'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)' }}>
        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 14px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: 'transparent',
            color: '#FF453A',
            fontSize: '13px',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
