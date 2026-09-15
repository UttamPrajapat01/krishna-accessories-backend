import React, { useEffect, useState } from 'react';
import { Eye, Check, X, Truck, PackageCheck, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { Order } from '../types';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(true);

  const statuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'OutForDelivery', 'Delivered', 'Cancelled'];

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      const url = statusFilter ? `/admin/orders?status=${statusFilter}` : '/admin/orders';
      const res = await api.get(url);
      if (res.data.success) {
        setOrders(res.data.data.items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openOrderModal = (o: Order) => {
    setSelectedOrder(o);
    setNewStatus(o.orderStatus);
    setTrackingNumber(o.trackingNumber || '');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      const res = await api.put(`/admin/orders/${selectedOrder.id}/status`, {
        orderStatus: newStatus,
        trackingNumber: trackingNumber || undefined
      });
      if (res.data.success) {
        setSelectedOrder(null);
        fetchOrders();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating order');
    }
  };

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="font-serif" style={{ fontSize: '18px', color: '#FFF' }}>Orders Pipeline</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Monitor and update status of luxury customer orders</p>
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setStatusFilter('')}
            className={statusFilter === '' ? 'btn-gold' : 'btn-secondary'}
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            All Orders
          </button>
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={statusFilter === s ? 'btn-gold' : 'btn-secondary'}
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              {s}
            </button>
          ))}
        </div>
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
              <th style={{ padding: '14px 16px' }}>Order Number</th>
              <th style={{ padding: '14px 16px' }}>Customer</th>
              <th style={{ padding: '14px 16px' }}>Total Amount</th>
              <th style={{ padding: '14px 16px' }}>Payment Method</th>
              <th style={{ padding: '14px 16px' }}>Payment Status</th>
              <th style={{ padding: '14px 16px' }}>Order Status</th>
              <th style={{ padding: '14px 16px' }}>Placed Date</th>
              <th style={{ padding: '14px 16px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--gold-light)' }}>{o.orderNumber}</td>
                <td style={{ padding: '12px 16px', color: '#FFF' }}>{o.customerName}</td>
                <td style={{ padding: '12px 16px', fontWeight: 700 }}>₹{o.totalAmount.toLocaleString('en-IN')}</td>
                <td style={{ padding: '12px 16px' }}>{o.paymentMethod}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span className={`badge ${o.paymentStatus === 'Captured' ? 'badge-success' : 'badge-warning'}`}>
                    {o.paymentStatus}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span className={`badge ${o.orderStatus === 'Delivered' ? 'badge-success' : o.orderStatus === 'Cancelled' ? 'badge-danger' : 'badge-gold'}`}>
                    {o.orderStatus}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                  {new Date(o.createdAt).toLocaleString()}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <button onClick={() => openOrderModal(o)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                    <Eye size={14} />
                    <span>Manage</span>
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: '28px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No orders found for this status.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail / Update Modal */}
      {selectedOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px'
        }}>
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-gold)', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 className="font-serif gold-gradient-text" style={{ fontSize: '18px' }}>
                  Order #{selectedOrder.orderNumber}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Customer: {selectedOrder.customerName} ({selectedOrder.customerEmail})</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {/* Items */}
            <div style={{ marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
              <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>Purchased Items</h4>
              {selectedOrder.items?.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '13px' }}>
                  <div>
                    <strong style={{ color: '#FFF' }}>{item.productName}</strong>
                    <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>x{item.quantity}</span>
                  </div>
                  <span style={{ color: 'var(--gold-light)' }}>₹{item.totalPrice.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            {/* Shipping Address */}
            <div style={{ marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
              <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>Delivery Address</h4>
              <p style={{ fontSize: '13px', color: '#E5E5EA', whiteSpace: 'pre-line' }}>{selectedOrder.shippingAddressSnapshot}</p>
            </div>

            {/* Status Update Form */}
            <form onSubmit={handleUpdateStatus} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Progression Status</label>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="input-field">
                  {statuses.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Courier / Tracking Number</label>
                <input
                  value={trackingNumber}
                  onChange={e => setTrackingNumber(e.target.value)}
                  className="input-field"
                  placeholder="e.g. BLUEDART-9876543210"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setSelectedOrder(null)} className="btn-secondary">Close</button>
                <button type="submit" className="btn-gold">Update Status & Notify Client</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
