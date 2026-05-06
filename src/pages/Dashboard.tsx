import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../App';

interface Stats {
  users: { total: number; active: number };
  orders: { total: number; pending: number };
  deposits: { total: number; today: number };
  revenue: { total: number; week: number };
}

interface RevenuePoint {
  _id: { date: string };
  revenue: number;
  orders: number;
}

const StatCard: React.FC<{
  label: string;
  value: string | number;
  sub?: string;
  icon: string;
  color: string;
  glowClass: string;
  delay?: number;
}> = ({ label, value, sub, icon, color, delay = 0 }) => (
  <div
    className={`stat-card animate-slide-up`}
    style={{
      animationDelay: `${delay}ms`,
      borderColor: `${color}20`,
    }}
  >
    <div className="absolute inset-0 rounded-xl overflow-hidden">
      <div
        className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10"
        style={{ background: `radial-gradient(circle, ${color}, transparent)` }}
      />
    </div>
    <div className="relative">
      <div className="stat-label">{label}</div>
      <div className="stat-number mt-2" style={{ color }}>
        {value}
      </div>
      {sub && (
        <div className="mt-1 text-xs font-mono-tech" style={{ color: '#3a4570' }}>
          {sub}
        </div>
      )}
    </div>
    <div className="stat-icon">{icon}</div>
  </div>
);

const MiniChart: React.FC<{ data: RevenuePoint[] }> = ({ data }) => {
  if (!data.length) return (
    <div className="flex items-center justify-center h-24 text-xs font-mono-tech" style={{ color: '#3a4570' }}>
      NO DATA
    </div>
  );

  const max = Math.max(...data.map(d => d.revenue));
  const last7 = data.slice(-14);

  return (
    <div className="flex items-end gap-1 h-24">
      {last7.map((d, i) => {
        const height = max > 0 ? (d.revenue / max) * 100 : 0;
        return (
          <div
            key={i}
            className="flex-1 rounded-sm transition-all duration-500 relative group"
            style={{
              height: `${Math.max(height, 4)}%`,
              background: `linear-gradient(to top, rgba(0,245,255,0.6), rgba(0,245,255,0.2))`,
              boxShadow: i === last7.length - 1 ? '0 0 8px rgba(0,245,255,0.4)' : 'none',
            }}
            title={`${d._id.date}: ${d.revenue} ETB`}
          >
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1 py-0.5 rounded text-xs font-mono-tech whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{ background: 'rgba(0,0,0,0.8)', color: 'var(--neon-cyan)', fontSize: '10px' }}>
              {d.revenue}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenuePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, revenueRes] = await Promise.all([
        API.get('/dashboard/stats'),
        API.get('/dashboard/charts/revenue'),
      ]);
      setStats(statsRes.data);
      setRevenueData(revenueRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 0 }).format(n);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="cyber-spinner mx-auto" />
          <p className="mt-3 font-mono-tech text-xs" style={{ color: '#3a4570' }}>
            LOADING SYSTEMS...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="font-rajdhani font-bold text-3xl tracking-wider"
            style={{ color: 'var(--neon-cyan)' }}
          >
            DASHBOARD
          </h1>
          <p className="font-mono-tech text-xs mt-1" style={{ color: '#3a4570' }}>
            SYSTEM OVERVIEW
          </p>
        </div>
        <button
          onClick={fetchAll}
          className="btn-primary flex items-center gap-2"
          style={{ padding: '8px 16px', fontSize: '12px' }}
        >
          ↺ REFRESH
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="TOTAL USERS"
          value={fmt(stats?.users?.total || 0)}
          sub={`${stats?.users?.active || 0} active`}
          icon="◉"
          color="var(--neon-cyan)"
          glowClass="glow-cyan"
          delay={0}
        />
        <StatCard
          label="TOTAL ORDERS"
          value={fmt(stats?.orders?.total || 0)}
          sub={`${stats?.orders?.pending || 0} pending`}
          icon="▦"
          color="var(--neon-purple)"
          glowClass="glow-purple"
          delay={100}
        />
        <StatCard
          label="TOTAL DEPOSITS"
          value={`${fmt(stats?.deposits?.total || 0)}`}
          sub={`+${fmt(stats?.deposits?.today || 0)} today`}
          icon="◎"
          color="var(--neon-green)"
          glowClass="glow-green"
          delay={200}
        />
        <StatCard
          label="REVENUE"
          value={`${fmt(stats?.revenue?.total || 0)}`}
          sub={`+${fmt(stats?.revenue?.week || 0)} this week`}
          icon="◈"
          color="var(--neon-orange)"
          glowClass="glow-orange"
          delay={300}
        />
      </div>

      {/* Revenue Chart + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart */}
        <div className="cyber-card p-5 lg:col-span-2 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-rajdhani font-bold text-lg tracking-wider" style={{ color: '#a0b4e0' }}>
                REVENUE TREND
              </h2>
              <p className="font-mono-tech text-xs" style={{ color: '#3a4570' }}>LAST 14 DAYS</p>
            </div>
            <div className="font-mono-tech text-xs px-2 py-1 rounded" style={{ background: 'rgba(0,245,255,0.08)', color: 'var(--neon-cyan)', border: '1px solid rgba(0,245,255,0.15)' }}>
              ETB
            </div>
          </div>
          <MiniChart data={revenueData} />

          {/* X labels */}
          {revenueData.length > 0 && (
            <div className="flex justify-between mt-2">
              {revenueData.slice(-14).filter((_, i) => i % 4 === 0).map((d) => (
                <span key={d._id.date} className="font-mono-tech" style={{ color: '#2a3555', fontSize: '9px' }}>
                  {d._id.date.slice(5)}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div className="cyber-card p-5 animate-slide-up" style={{ animationDelay: '500ms' }}>
          <h2 className="font-rajdhani font-bold text-lg tracking-wider mb-4" style={{ color: '#a0b4e0' }}>
            QUICK STATS
          </h2>
          <div className="space-y-4">
            {[
              { label: 'Pending Orders', value: stats?.orders?.pending || 0, color: 'var(--neon-orange)', bar: Math.min(((stats?.orders?.pending || 0) / Math.max(stats?.orders?.total || 1, 1)) * 100, 100) },
              { label: 'Active Users', value: stats?.users?.active || 0, color: 'var(--neon-cyan)', bar: Math.min(((stats?.users?.active || 0) / Math.max(stats?.users?.total || 1, 1)) * 100, 100) },
              { label: "Today's Deposits", value: `${fmt(stats?.deposits?.today || 0)} ETB`, color: 'var(--neon-green)', bar: Math.min(((stats?.deposits?.today || 0) / Math.max(stats?.deposits?.total || 1, 1)) * 100, 100) },
              { label: "Week Revenue", value: `${fmt(stats?.revenue?.week || 0)} ETB`, color: 'var(--neon-purple)', bar: Math.min(((stats?.revenue?.week || 0) / Math.max(stats?.revenue?.total || 1, 1)) * 100, 100) },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between mb-1">
                  <span className="font-exo text-xs" style={{ color: '#6b7db5' }}>{item.label}</span>
                  <span className="font-mono-tech text-xs" style={{ color: item.color }}>{item.value}</span>
                </div>
                <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${item.bar}%`, background: item.color, boxShadow: `0 0 8px ${item.color}60` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="animate-slide-up" style={{ animationDelay: '600ms' }}>
        <h2 className="font-rajdhani font-bold text-base tracking-widest mb-3" style={{ color: '#4a5580' }}>
          QUICK ACTIONS
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: '/deposit', icon: '◎', label: 'Add Deposit', color: 'var(--neon-green)', bg: 'rgba(0,255,136,0.06)', border: 'rgba(0,255,136,0.15)' },
            { to: '/orders', icon: '▦', label: 'View Orders', color: 'var(--neon-cyan)', bg: 'rgba(0,245,255,0.06)', border: 'rgba(0,245,255,0.15)' },
            { to: '/support', icon: '◉', label: 'User Support', color: 'var(--neon-purple)', bg: 'rgba(191,0,255,0.06)', border: 'rgba(191,0,255,0.15)' },
            { to: '/sendm', icon: '◈', label: 'Broadcast', color: 'var(--neon-orange)', bg: 'rgba(255,107,0,0.06)', border: 'rgba(255,107,0,0.15)' },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="cyber-card p-4 text-center flex flex-col items-center gap-2 active:scale-95 transition-transform"
              style={{ borderColor: item.border, background: item.bg }}
            >
              <span className="text-2xl" style={{ color: item.color }}>{item.icon}</span>
              <span className="font-rajdhani font-bold text-sm tracking-wide" style={{ color: item.color }}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
