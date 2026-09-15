import React, { useState } from 'react';
import { Send, Bell, Sparkles } from 'lucide-react';
import api from '../services/api';

export const NotificationsPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('Promo');
  const [sent, setSent] = useState(false);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/notifications/broadcast', { title, message, type });
      setSent(true);
      setTitle('');
      setMessage('');
      setTimeout(() => setSent(false), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error broadcasting');
    }
  };

  return (
    <div style={{ padding: '28px', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 className="font-serif" style={{ fontSize: '18px', color: '#FFF' }}>Broadcast Notifications</h2>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Send high-priority promotions & updates to all mobile customers</p>
      </div>

      {sent && (
        <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(52, 199, 89, 0.1)', border: '1px solid rgba(52, 199, 89, 0.3)', color: '#34C759', fontSize: '13px' }}>
          ✓ Notification successfully dispatched to all active client accounts!
        </div>
      )}

      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px' }}>
        <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Campaign Title</label>
            <input required value={title} onChange={e => setTitle(e.target.value)} className="input-field" placeholder="e.g. Exclusive Private Sale" />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Category</label>
            <select value={type} onChange={e => setType(e.target.value)} className="input-field">
              <option value="Promo">Promotion / Private Sale</option>
              <option value="Order">Order Bulletin</option>
              <option value="System">System Advisory</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Notification Body</label>
            <textarea required rows={4} value={message} onChange={e => setMessage(e.target.value)} className="input-field" placeholder="Craft your message to luxury patrons..." />
          </div>

          <button type="submit" className="btn-gold" style={{ justifyContent: 'center', padding: '12px' }}>
            <Send size={16} />
            <span>Broadcast Immediately</span>
          </button>
        </form>
      </div>
    </div>
  );
};
