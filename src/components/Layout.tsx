import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

interface LayoutProps {
  onLogout: () => void;
  role: string;
}

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: '◈', exact: true },
  { path: '/orders', label: 'Orders', icon: '▦' },
  { path: '/deposit', label: 'Deposit', icon: '◎' },
  { path: '/support', label: 'Users', icon: '◉' },
  { path: '/sendm', label: 'Broadcast', icon: '◈' },
  { path: '/notifications', label: 'Notifications', icon: '◇' },
];

const Layout: React.FC<LayoutProps> = ({ onLogout, role }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-grid" style={{ background: 'var(--bg-dark)' }}>
      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none scanline z-50 opacity-30" />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed lg:static top-0 left-0 h-full z-40
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          width: '220px',
          minWidth: '220px',
          background: 'rgba(8, 12, 25, 0.98)',
          borderRight: '1px solid rgba(0,245,255,0.1)',
        }}
      >
        {/* Logo */}
        <div className="p-5 pb-4" style={{ borderBottom: '1px solid rgba(0,245,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-lg animate-pulse-glow"
              style={{
                background: 'linear-gradient(135deg, rgba(0,245,255,0.2), rgba(191,0,255,0.2))',
                border: '1px solid rgba(0,245,255,0.3)',
              }}
            >
              🎮
            </div>
            <div>
              <div
                className="font-rajdhani font-bold text-base leading-none"
                style={{ color: 'var(--neon-cyan)', letterSpacing: '1px' }}
              >
                HABESHA<span style={{ color: 'var(--neon-purple)' }}>X</span>
              </div>
              <div className="text-xs font-mono-tech mt-0.5" style={{ color: '#3a4570', fontSize: '9px', letterSpacing: '2px' }}>
                ADMIN PANEL
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <div className="mb-2" style={{ color: '#2a3555', fontSize: '9px', letterSpacing: '2px', fontFamily: "'Share Tech Mono', monospace", padding: '8px 14px 4px' }}>
            NAVIGATION
          </div>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) => `nav-item mb-1 ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}

          {role === 'super_admin' && (
            <>
              <div className="mt-4 mb-2" style={{ color: '#2a3555', fontSize: '9px', letterSpacing: '2px', fontFamily: "'Share Tech Mono', monospace", padding: '8px 14px 4px' }}>
                SUPER ADMIN
              </div>
              <NavLink
                to="/admins"
                className={({ isActive }) => `nav-item mb-1 ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="text-base w-5 text-center">🛡</span>
                <span>Admins</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* Bottom */}
        <div className="p-3" style={{ borderTop: '1px solid rgba(0,245,255,0.08)' }}>
          <div className="flex items-center gap-2 px-3 py-2 mb-2 rounded-md" style={{ background: 'rgba(0,245,255,0.04)' }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
              style={{ background: 'linear-gradient(135deg, rgba(0,245,255,0.2), rgba(191,0,255,0.2))', border: '1px solid rgba(0,245,255,0.2)' }}>
              {role === 'super_admin' ? '🛡' : '👤'}
            </div>
            <div>
              <div className="font-rajdhani font-bold text-xs" style={{ color: '#a0b4e0' }}>
                {role === 'super_admin' ? 'SUPER ADMIN' : 'ADMIN'}
              </div>
              <div className="font-mono-tech text-xs" style={{ color: '#3a4570', fontSize: '10px' }}>
                {role.toUpperCase()}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full nav-item"
            style={{ color: '#ff406080', borderColor: 'transparent' }}
          >
            <span>⊗</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header
          className="flex items-center justify-between px-4 py-3"
          style={{
            borderBottom: '1px solid rgba(0,245,255,0.08)',
            background: 'rgba(8, 12, 25, 0.9)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <button
            className="lg:hidden p-2 rounded"
            style={{ color: 'var(--neon-cyan)', border: '1px solid rgba(0,245,255,0.2)' }}
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>

          <div className="font-mono-tech text-xs hidden sm:block" style={{ color: '#3a4570' }}>
            {new Date().toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--neon-green)' }} />
            <span className="font-mono-tech text-xs" style={{ color: 'var(--neon-green)' }}>ONLINE</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
