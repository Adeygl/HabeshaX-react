import React, { useState } from 'react';
import type { AxiosInstance } from 'axios';

interface LoginProps {
  setAuth: (value: boolean) => void;
  setRole: (role: string) => void;
  api: AxiosInstance;
}

const Login: React.FC<LoginProps> = ({ setAuth, setRole, api }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async () => {
    if (!username || !password) {
      setError('Enter credentials');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user?.role || '');
      setRole(res.data.user?.role || '');
      setAuth(true);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-grid"
      style={{ background: 'var(--bg-dark)' }}
    >
      {/* Animated bg particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 300 + 100}px`,
              height: `${Math.random() * 300 + 100}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 2 === 0
                ? 'radial-gradient(circle, rgba(0,245,255,0.04) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(191,0,255,0.04) 0%, transparent 70%)',
              transform: 'translate(-50%, -50%)',
              animation: `float ${3 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-md px-4 animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 text-4xl animate-float"
            style={{
              background: 'linear-gradient(135deg, rgba(0,245,255,0.15), rgba(191,0,255,0.15))',
              border: '1px solid rgba(0,245,255,0.25)',
              boxShadow: '0 0 40px rgba(0,245,255,0.1)',
            }}
          >
            🎮
          </div>
          <h1
            className="font-rajdhani font-bold text-4xl tracking-widest"
            style={{ color: 'var(--neon-cyan)' }}
          >
            HABESHA<span style={{ color: 'var(--neon-purple)' }}>X</span>
          </h1>
          <p className="font-mono-tech text-xs mt-1" style={{ color: '#3a4570', letterSpacing: '3px' }}>
            ADMIN CONTROL SYSTEM
          </p>
        </div>

        {/* Card */}
        <div
          className="cyber-card p-8"
          style={{
            boxShadow: '0 0 60px rgba(0,245,255,0.06), inset 0 1px 0 rgba(0,245,255,0.05)',
          }}
        >
          {/* Corner decoration */}
          <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden">
            <div
              className="absolute -top-px -right-px w-8 h-8"
              style={{
                borderTop: '2px solid var(--neon-cyan)',
                borderRight: '2px solid var(--neon-cyan)',
                opacity: 0.5,
              }}
            />
          </div>
          <div className="absolute bottom-0 left-0 w-12 h-12 overflow-hidden">
            <div
              className="absolute -bottom-px -left-px w-8 h-8"
              style={{
                borderBottom: '2px solid var(--neon-purple)',
                borderLeft: '2px solid var(--neon-purple)',
                opacity: 0.5,
              }}
            />
          </div>

          <h2
            className="font-rajdhani font-bold text-xl mb-6 tracking-wider"
            style={{ color: '#a0b4e0' }}
          >
            AUTHENTICATE
          </h2>

          {error && (
            <div
              className="mb-4 p-3 rounded text-sm font-exo"
              style={{
                background: 'rgba(255,0,128,0.08)',
                border: '1px solid rgba(255,0,128,0.25)',
                color: 'var(--neon-pink)',
              }}
            >
              ⚠ {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block font-rajdhani font-bold text-xs mb-2 tracking-widest" style={{ color: '#4a5580' }}>
                USERNAME
              </label>
              <input
                className="cyber-input"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && login()}
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block font-rajdhani font-bold text-xs mb-2 tracking-widest" style={{ color: '#4a5580' }}>
                PASSWORD
              </label>
              <input
                className="cyber-input"
                placeholder="Enter password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && login()}
                autoComplete="current-password"
              />
            </div>

            <button
              onClick={login}
              disabled={loading}
              className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
              style={{ padding: '14px', fontSize: '15px' }}
            >
              {loading ? (
                <>
                  <div className="cyber-spinner" style={{ width: 18, height: 18 }} />
                  AUTHENTICATING...
                </>
              ) : (
                '⊞ ACCESS SYSTEM'
              )}
            </button>
          </div>
        </div>

        <p className="text-center mt-6 font-mono-tech text-xs" style={{ color: '#1e2840' }}>
          HABESHAX GAMING PLATFORM v2.0
        </p>
      </div>
    </div>
  );
};

export default Login;
