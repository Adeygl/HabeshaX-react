import React, { useEffect, useState } from 'react';
import { API } from '../App';

interface Admin {
  _id: string;
  username: string;
  role: string;
  permissions: string[];
  last_login?: string;
  created_at: string;
}

const Admins: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admins');
      setAdmins(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!username || !password) { setError('Username and password required'); return; }
    setCreateLoading(true); setError('');
    try {
      await API.post('/admins', { username, password, role, permissions: role === 'super_admin' ? ['all'] : [] });
      setSuccess(`Admin "${username}" created!`);
      setUsername(''); setPassword(''); setRole('admin');
      setShowCreate(false);
      fetchAdmins();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Error creating admin');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = async (u: string) => {
    try {
      await API.delete(`/admins/${u}`);
      setDeleteConfirm(null);
      fetchAdmins();
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-rajdhani font-bold text-3xl tracking-wider" style={{ color: 'var(--neon-cyan)' }}>
            ADMINS
          </h1>
          <p className="font-mono-tech text-xs mt-1" style={{ color: '#3a4570' }}>
            SUPER ADMIN CONTROL
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          + CREATE ADMIN
        </button>
      </div>

      {success && (
        <div className="p-3 rounded text-sm font-exo" style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.25)', color: 'var(--neon-green)' }}>
          ✓ {success}
        </div>
      )}

      {/* Admins Table */}
      <div className="cyber-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="cyber-spinner" /></div>
        ) : (
          <table className="cyber-table">
            <thead>
              <tr>
                <th>USERNAME</th>
                <th>ROLE</th>
                <th>LAST LOGIN</th>
                <th>CREATED</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {admins.map(a => (
                <tr key={a._id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{a.role === 'super_admin' ? '🛡️' : '👤'}</span>
                      <span className="font-rajdhani font-bold" style={{ color: '#e0e8ff' }}>{a.username}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${a.role === 'super_admin' ? 'badge-processing' : 'badge-active'}`}>
                      {a.role.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="font-mono-tech text-xs" style={{ color: '#4a5580' }}>
                    {a.last_login ? new Date(a.last_login).toLocaleString() : 'Never'}
                  </td>
                  <td className="font-mono-tech text-xs" style={{ color: '#4a5580' }}>
                    {new Date(a.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    {a.role !== 'super_admin' && (
                      <button
                        className="btn-danger"
                        style={{ padding: '4px 12px', fontSize: '11px' }}
                        onClick={() => setDeleteConfirm(a.username)}
                      >
                        DELETE
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="cyber-modal-overlay">
          <div className="cyber-modal">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-rajdhani font-bold text-xl tracking-wider" style={{ color: 'var(--neon-cyan)' }}>
                CREATE ADMIN
              </h2>
              <button onClick={() => { setShowCreate(false); setError(''); }} style={{ color: '#4a5580', fontSize: '20px' }}>✕</button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded text-sm" style={{ background: 'rgba(255,0,128,0.08)', border: '1px solid rgba(255,0,128,0.25)', color: 'var(--neon-pink)' }}>
                ⚠ {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block font-rajdhani font-bold text-xs mb-2 tracking-widest" style={{ color: '#4a5580' }}>USERNAME</label>
                <input className="cyber-input" placeholder="admin_username" value={username} onChange={e => setUsername(e.target.value)} />
              </div>
              <div>
                <label className="block font-rajdhani font-bold text-xs mb-2 tracking-widest" style={{ color: '#4a5580' }}>PASSWORD</label>
                <input className="cyber-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <div>
                <label className="block font-rajdhani font-bold text-xs mb-2 tracking-widest" style={{ color: '#4a5580' }}>ROLE</label>
                <select className="cyber-input" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div className="flex gap-3 mt-2">
                <button onClick={handleCreate} disabled={createLoading} className="btn-primary flex-1" style={{ padding: '12px' }}>
                  {createLoading ? 'CREATING...' : '+ CREATE'}
                </button>
                <button onClick={() => { setShowCreate(false); setError(''); }} className="btn-primary flex-1" style={{ padding: '12px', borderColor: 'rgba(255,255,255,0.1)', color: '#6b7db5' }}>
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="cyber-modal-overlay">
          <div className="cyber-modal" style={{ maxWidth: '360px' }}>
            <div className="text-center">
              <div className="text-4xl mb-3">⚠</div>
              <h2 className="font-rajdhani font-bold text-xl tracking-wider mb-2" style={{ color: 'var(--neon-pink)' }}>
                DELETE ADMIN
              </h2>
              <p className="font-exo text-sm mb-5" style={{ color: '#8090b0' }}>
                Are you sure you want to delete <strong style={{ color: '#e0e8ff' }}>{deleteConfirm}</strong>? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button className="btn-danger flex-1" style={{ padding: '12px' }} onClick={() => handleDelete(deleteConfirm)}>
                  DELETE
                </button>
                <button className="btn-primary flex-1" style={{ padding: '12px' }} onClick={() => setDeleteConfirm(null)}>
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admins;
