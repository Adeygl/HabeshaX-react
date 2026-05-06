import React, { useEffect, useState } from 'react';
import { API } from '../App';

interface NotifLog {
  _id: string;
  telegram_id: string;
  message: string;
  status: 'sent' | 'failed';
  sent_at: string;
  error?: string;
}

const Notifications: React.FC = () => {
  const [logs, setLogs] = useState<NotifLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const LIMIT = 20;

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: LIMIT };
      if (search) params.telegram_id = search;
      const res = await API.get('/notifications/logs', { params });
      setLogs(res.data.logs || []);
      setTotal(res.data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const pages = Math.ceil(total / LIMIT);
  const sentCount = logs.filter(l => l.status === 'sent').length;
  const failedCount = logs.filter(l => l.status === 'failed').length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-rajdhani font-bold text-3xl tracking-wider" style={{ color: 'var(--neon-cyan)' }}>
          NOTIFICATIONS
        </h1>
        <p className="font-mono-tech text-xs mt-1" style={{ color: '#3a4570' }}>
          {total} LOG RECORDS
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { l: 'TOTAL', v: total, c: 'var(--neon-cyan)' },
          { l: 'SENT', v: sentCount, c: 'var(--neon-green)' },
          { l: 'FAILED', v: failedCount, c: 'var(--neon-pink)' },
        ].map(s => (
          <div key={s.l} className="cyber-card p-3 text-center">
            <div className="font-rajdhani font-bold text-xs tracking-widest" style={{ color: '#4a5580' }}>{s.l}</div>
            <div className="font-mono-tech text-xl mt-1" style={{ color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="cyber-card p-4">
        <div className="flex gap-3">
          <input
            className="cyber-input flex-1"
            placeholder="Filter by Telegram ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); fetchLogs(); } }}
          />
          <button className="btn-primary" onClick={() => { setPage(1); fetchLogs(); }}>FILTER</button>
        </div>
      </div>

      {/* Logs */}
      <div className="cyber-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="cyber-spinner" />
          </div>
        ) : (
          <div>
            {logs.length === 0 ? (
              <div className="text-center py-12 font-mono-tech text-xs" style={{ color: '#3a4570' }}>
                NO LOGS FOUND
              </div>
            ) : logs.map(log => (
              <div
                key={log._id}
                className="p-4 cursor-pointer"
                style={{ borderBottom: '1px solid rgba(0,245,255,0.05)' }}
                onClick={() => setExpanded(expanded === log._id ? null : log._id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span
                      className="shrink-0 w-2 h-2 rounded-full mt-1.5"
                      style={{
                        background: log.status === 'sent' ? 'var(--neon-green)' : 'var(--neon-pink)',
                        boxShadow: `0 0 6px ${log.status === 'sent' ? 'var(--neon-green)' : 'var(--neon-pink)'}`,
                      }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono-tech text-xs" style={{ color: 'var(--neon-cyan)' }}>
                          {log.telegram_id}
                        </span>
                        <span className={`badge ${log.status === 'sent' ? 'badge-delivered' : 'badge-declined'}`}>
                          {log.status}
                        </span>
                      </div>
                      <p
                        className="font-exo text-xs mt-1 truncate"
                        style={{ color: '#6b7db5', maxWidth: '400px' }}
                      >
                        {log.message.replace(/<[^>]+>/g, '').substring(0, 100)}
                      </p>
                      {log.error && (
                        <p className="font-exo text-xs mt-0.5" style={{ color: 'var(--neon-pink)' }}>
                          ✗ {log.error}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-mono-tech text-xs" style={{ color: '#3a4570' }}>
                      {new Date(log.sent_at).toLocaleTimeString()}
                    </div>
                    <div className="font-mono-tech text-xs" style={{ color: '#2a3555' }}>
                      {new Date(log.sent_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {expanded === log._id && (
                  <div
                    className="mt-3 p-3 rounded font-mono-tech text-xs"
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(0,245,255,0.08)',
                      color: '#8090b0',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {log.message}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid rgba(0,245,255,0.06)' }}>
            <span className="font-mono-tech text-xs" style={{ color: '#3a4570' }}>
              PAGE {page} / {pages}
            </span>
            <div className="flex gap-2">
              <button className="btn-primary" style={{ padding: '6px 14px', fontSize: '11px' }}
                onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                ← PREV
              </button>
              <button className="btn-primary" style={{ padding: '6px 14px', fontSize: '11px' }}
                onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>
                NEXT →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
