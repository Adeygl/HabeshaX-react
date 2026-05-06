import React, { useEffect, useState } from 'react';
import { API } from '../App';

interface User {
  telegram_id: string;
  first_name: string;
  username: string;
  balance: number;
  hold_balance: number;
  total_orders: number;
  total_deposits: number;
  is_blocked: boolean;
  created_at: string;
  last_active?: string;
}

const Support: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/users', { params: { search, limit: 100 } });
      let u = res.data.users || [];
      u.sort((a: User, b: User) =>
        sortOrder === 'desc' ? b.balance - a.balance : a.balance - b.balance
      );
      setUsers(u);
      setTotal(res.data.total || u.length);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = () => {
    const next = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(next);
    setUsers(prev => [...prev].sort((a, b) =>
      next === 'desc' ? b.balance - a.balance : a.balance - b.balance
    ));
  };

  const openUser = async (user: User) => {
    setSelectedUser(user);
    setOrdersLoading(true);
    try {
      const res = await API.get(`/users/${user.telegram_id}/orders`);
      setOrders(res.data || []);
    } catch (e) {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleBlock = async (user: User, block: boolean) => {
    setBlockLoading(true);
    try {
      await API.put(`/users/${user.telegram_id}/block`, { is_blocked: block });
      setSelectedUser(prev => prev ? { ...prev, is_blocked: block } : null);
      setUsers(prev => prev.map(u =>
        u.telegram_id === user.telegram_id ? { ...u, is_blocked: block } : u
      ));
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Error');
    } finally {
      setBlockLoading(false);
    }
  };

  const totalBalance = users.reduce((s, u) => s + u.balance, 0);
  const activeCount = users.filter(u => !u.is_blocked).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-rajdhani font-bold text-3xl tracking-wider" style={{ color: 'var(--neon-cyan)' }}>
            USERS
          </h1>
          <p className="font-mono-tech text-xs mt-1" style={{ color: '#3a4570' }}>
            {total} REGISTERED USERS
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'TOTAL USERS', val: users.length, color: 'var(--neon-cyan)' },
          { label: 'ACTIVE', val: activeCount, color: 'var(--neon-green)' },
          { label: 'TOTAL BALANCE', val: `${totalBalance.toLocaleString()} ETB`, color: 'var(--neon-orange)' },
        ].map(s => (
          <div key={s.label} className="cyber-card p-3 text-center">
            <div className="font-rajdhani font-bold text-xs tracking-widest" style={{ color: '#4a5580' }}>{s.label}</div>
            <div className="font-mono-tech text-lg font-bold mt-1" style={{ color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="cyber-card p-4">
        <div className="flex gap-3">
          <input
            className="cyber-input flex-1"
            placeholder="Search by Telegram ID, name, or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
          />
          <button className="btn-primary" onClick={fetchUsers}>SEARCH</button>
        </div>
      </div>

      {/* Table */}
      <div className="cyber-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="cyber-spinner" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>TELEGRAM ID</th>
                  <th>NAME</th>
                  <th>USERNAME</th>
                  <th
                    className="cursor-pointer"
                    onClick={handleSort}
                    style={{ userSelect: 'none' }}
                  >
                    BALANCE {sortOrder === 'desc' ? '↓' : '↑'}
                  </th>
                  <th>ORDERS</th>
                  <th>STATUS</th>
                  <th>JOINED</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 font-mono-tech" style={{ color: '#3a4570' }}>
                      NO USERS FOUND
                    </td>
                  </tr>
                ) : users.map(u => (
                  <tr
                    key={u.telegram_id}
                    className="cursor-pointer"
                    onClick={() => openUser(u)}
                  >
                    <td>
                      <span className="font-mono-tech text-xs" style={{ color: 'var(--neon-cyan)' }}>
                        {u.telegram_id}
                      </span>
                    </td>
                    <td className="font-exo">{u.first_name || '-'}</td>
                    <td className="font-exo text-sm" style={{ color: '#6b7db5' }}>
                      {u.username ? `@${u.username}` : '-'}
                    </td>
                    <td>
                      <span className="font-mono-tech text-sm" style={{ color: 'var(--neon-green)' }}>
                        {u.balance.toLocaleString()} ETB
                      </span>
                    </td>
                    <td className="font-mono-tech text-sm" style={{ color: '#6b7db5' }}>
                      {u.total_orders}
                    </td>
                    <td>
                      <span className={`badge ${u.is_blocked ? 'badge-blocked' : 'badge-active'}`}>
                        {u.is_blocked ? 'BLOCKED' : 'ACTIVE'}
                      </span>
                    </td>
                    <td className="font-mono-tech text-xs" style={{ color: '#4a5580' }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="cyber-modal-overlay" onClick={() => setSelectedUser(null)}>
          <div
            className="cyber-modal"
            style={{ maxWidth: '560px', maxHeight: '85vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-rajdhani font-bold text-xl tracking-wider" style={{ color: 'var(--neon-cyan)' }}>
                USER PROFILE
              </h2>
              <button onClick={() => setSelectedUser(null)} style={{ color: '#4a5580', fontSize: '20px' }}>✕</button>
            </div>

            {/* User info */}
            <div className="p-4 rounded-lg mb-4" style={{ background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.1)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.2)' }}
                >
                  {selectedUser.first_name?.[0] || '?'}
                </div>
                <div>
                  <div className="font-exo font-bold text-lg" style={{ color: '#e0e8ff' }}>
                    {selectedUser.first_name || 'Unknown'}
                  </div>
                  <div className="font-mono-tech text-xs" style={{ color: '#4a5580' }}>
                    {selectedUser.username ? `@${selectedUser.username}` : 'No username'}
                  </div>
                </div>
                <span className={`badge ml-auto ${selectedUser.is_blocked ? 'badge-blocked' : 'badge-active'}`}>
                  {selectedUser.is_blocked ? 'BLOCKED' : 'ACTIVE'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { l: 'Balance', v: `${selectedUser.balance.toLocaleString()} ETB`, c: 'var(--neon-green)' },
                  { l: 'Orders', v: selectedUser.total_orders, c: 'var(--neon-cyan)' },
                  { l: 'Deposits', v: `${(selectedUser.total_deposits || 0).toLocaleString()} ETB`, c: 'var(--neon-purple)' },
                ].map(item => (
                  <div key={item.l} className="text-center p-2 rounded" style={{ background: 'rgba(0,0,0,0.2)' }}>
                    <div className="font-mono-tech text-sm font-bold" style={{ color: item.c }}>{item.v}</div>
                    <div className="font-exo text-xs" style={{ color: '#4a5580' }}>{item.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-5">
              {selectedUser.is_blocked ? (
                <button
                  className="btn-success flex-1"
                  onClick={() => handleBlock(selectedUser, false)}
                  disabled={blockLoading}
                >
                  🔓 UNBLOCK USER
                </button>
              ) : (
                <button
                  className="btn-danger flex-1"
                  onClick={() => handleBlock(selectedUser, true)}
                  disabled={blockLoading}
                >
                  🔒 BLOCK USER
                </button>
              )}
            </div>

            {/* Recent Orders */}
            <div>
              <h3 className="font-rajdhani font-bold text-base tracking-wider mb-3" style={{ color: '#6b7db5' }}>
                RECENT ORDERS
              </h3>
              {ordersLoading ? (
                <div className="text-center py-4"><div className="cyber-spinner mx-auto" /></div>
              ) : orders.length === 0 ? (
                <div className="text-center py-4 font-mono-tech text-xs" style={{ color: '#3a4570' }}>NO ORDERS</div>
              ) : (
                <div className="space-y-2">
                  {orders.slice(0, 5).map(o => (
                    <div key={o._id} className="flex items-center justify-between p-3 rounded" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(0,245,255,0.06)' }}>
                      <div>
                        <div className="font-mono-tech text-xs" style={{ color: 'var(--neon-cyan)' }}>{o.order_id}</div>
                        <div className="font-exo text-xs mt-0.5" style={{ color: '#6b7db5' }}>{o.game} · {o.package_name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono-tech text-sm" style={{ color: 'var(--neon-green)' }}>{o.sell_price?.toLocaleString()} ETB</div>
                        <span className={`badge badge-${o.status}`} style={{ fontSize: '10px' }}>{o.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;
