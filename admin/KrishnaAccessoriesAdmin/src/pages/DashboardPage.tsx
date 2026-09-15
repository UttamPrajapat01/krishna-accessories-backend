import React, { useEffect, useState } from 'react';
import { ShoppingBag, Users, Package, AlertTriangle, TrendingUp, IndianRupee, Clock, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { DashboardStats } from '../types';
import { StatCard } from '../components/StatCard';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard statistics', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '30px', color: 'var(--gold-light)' }}>Loading Luxury Dashboard...</div>;
  }

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <StatCard
          title="Total Revenue"
          value={`₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`}
          subtitle="All confirmed and delivered transactions"
          icon={IndianRupee}
          badgeText="Captured"
          badgeType="gold"
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          subtitle={`${stats?.pendingOrders || 0} active / pending`}
          icon={ShoppingBag}
          badgeText="Orders"
          badgeType="info"
        />
        <StatCard
          title="Luxury Catalog"
          value={stats?.totalProducts || 0}
          subtitle="Active products in stock"
          icon={Package}
          badgeText="Active"
          badgeType="success"
        />
        <StatCard
          title="Valued Clients"
          value={stats?.totalCustomers || 0}
          subtitle="Registered clientele accounts"
          icon={Users}
          badgeText="Clients"
          badgeType="gold"
        />
        <StatCard
          title="Stock Alerts"
          value={stats?.lowStockProductsCount || 0}
          subtitle="Items below threshold"
          icon={AlertTriangle}
          badgeText={stats?.lowStockProductsCount ? "Attention" : "Healthy"}
          badgeType={stats?.lowStockProductsCount ? "warning" : "success"}
        />
      </div>

      {/* Grid: Recent Orders and Low Stock Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Recent Orders */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '22px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h3 className="font-serif" style={{ fontSize: '16px', color: '#FFF' }}>
              Recent Luxury Orders
            </h3>
            <button onClick={() => onNavigate('orders')} className="btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 8px' }}>Order #</th>
                <th style={{ padding: '10px 8px' }}>Customer</th>
                <th style={{ padding: '10px 8px' }}>Amount</th>
                <th style={{ padding: '10px 8px' }}>Status</th>
                <th style={{ padding: '10px 8px' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders?.map((order) => (
                <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--gold-light)' }}>
                    {order.orderNumber}
                  </td>
                  <td style={{ padding: '12px 8px', color: '#FFF' }}>
                    {order.customerName}
                  </td>
                  <td style={{ padding: '12px 8px', fontWeight: 600 }}>
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <span className={`badge ${order.orderStatus === 'Delivered' ? 'badge-success' : 'badge-gold'}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                <tr>
                  <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No orders placed yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Low Stock Alerts */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '22px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h3 className="font-serif" style={{ fontSize: '16px', color: '#FFF' }}>
              Low Stock Alerts
            </h3>
            <button onClick={() => onNavigate('inventory')} className="btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>
              <span>Inventory</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats?.lowStockProducts?.map((item) => (
              <div key={item.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px',
                backgroundColor: 'rgba(255, 69, 58, 0.05)',
                border: '1px solid rgba(255, 69, 58, 0.2)',
                borderRadius: '8px'
              }}>
                <img
                  src={item.mainImageUrl || 'https://via.placeholder.com/40'}
                  alt={item.name}
                  style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#FFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SKU: {item.sku}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-danger" style={{ fontSize: '11px' }}>
                    {item.stockQuantity} left
                  </span>
                </div>
              </div>
            ))}
            {(!stats?.lowStockProducts || stats.lowStockProducts.length === 0) && (
              <p style={{ color: 'var(--accent-success)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                ✓ All inventory items are adequately stocked.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
