import React, { useState } from 'react';
import { Gem, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import api from '../services/api';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@krishnaaccessories.com');
  const [password, setPassword] = useState('Admin@123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token, user } = res.data.data;
        if (user.role !== 'Admin') {
          setError('Access Denied: Only administrators can access this portal.');
          return;
        }
        localStorage.setItem('krishna_admin_token', token);
        localStorage.setItem('krishna_admin_user', JSON.stringify(user));
        onLoginSuccess();
      } else {
        setError(res.data.message || 'Login failed.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials or API unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-primary)',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-gold)',
        borderRadius: '16px',
        padding: '36px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            margin: '0 auto 16px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #D4AF37 0%, #996515 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0A0A0D'
          }}>
            <Gem size={32} />
          </div>
          <h1 className="font-serif gold-gradient-text" style={{ fontSize: '24px', fontWeight: 700 }}>
            KRISHNA ACCESSORIES
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '4px' }}>
            Luxury Admin Portal
          </p>
        </div>

        {error && (
          <div style={{
            padding: '12px',
            marginBottom: '20px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 69, 58, 0.1)',
            border: '1px solid rgba(255, 69, 58, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#FF453A',
            fontSize: '13px'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Administrator Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--gold-primary)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '38px' }}
                placeholder="admin@krishnaaccessories.com"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Secret Key / Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--gold-primary)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '38px' }}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '10px', fontSize: '14px' }}
          >
            {loading ? 'Authenticating...' : (
              <>
                <span>Enter Administration</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '11px', color: 'var(--text-dim)' }}>
          Seed Admin: admin@krishnaaccessories.com | Admin@123456
        </div>
      </div>
    </div>
  );
};
