import React, { useEffect, useState } from 'react';
import { Star, Check, X } from 'lucide-react';
import api from '../services/api';
import { Review } from '../types';

export const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await api.get('/admin/reviews');
      if (res.data.success) setReviews(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async (id: string, isApproved: boolean) => {
    await api.put(`/admin/reviews/${id}/approve?isApproved=${isApproved}`);
    fetchReviews();
  };

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 className="font-serif" style={{ fontSize: '18px', color: '#FFF' }}>Review Moderation</h2>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Audit and approve verified client testimonials</p>
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
              <th style={{ padding: '14px 16px' }}>Client</th>
              <th style={{ padding: '14px 16px' }}>Rating</th>
              <th style={{ padding: '14px 16px' }}>Feedback</th>
              <th style={{ padding: '14px 16px' }}>Date</th>
              <th style={{ padding: '14px 16px' }}>Status</th>
              <th style={{ padding: '14px 16px', textAlign: 'right' }}>Moderation</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: '#FFF' }}>{r.userName}</td>
                <td style={{ padding: '12px 16px', color: 'var(--gold-primary)' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</td>
                <td style={{ padding: '12px 16px', color: '#E5E5EA', maxWidth: '300px' }}>{r.comment}</td>
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span className={`badge ${r.isApproved ? 'badge-success' : 'badge-danger'}`}>
                    {r.isApproved ? 'Approved' : 'Hidden'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  {r.isApproved ? (
                    <button onClick={() => handleApprove(r.id, false)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }}>
                      Hide
                    </button>
                  ) : (
                    <button onClick={() => handleApprove(r.id, true)} className="btn-gold" style={{ padding: '4px 8px', fontSize: '11px' }}>
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
