import React, { useEffect, useState } from 'react';
import { API } from '../App';

interface Deposit {
  _id: string;
  telegram_id: string;
  amount: number;
  type: string;
  admin: string;
  reference: string;
  notes?: string;
  status: string;
  created_at: string;
}

interface DepositStats {
  today: { total: number; count: number };
  week: { total: number; count: number };
  month: { total: number; count: number };
  total: { total: number; count: number };
}

const Deposit: React.FC = () => {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [stats, setStats] = useState<DepositStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [telegramId, setTelegramId] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [type, setType] = useState('manual');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchDeposits();
    fetchStats();
  }, []);

  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const res = await API.get('/deposits', { params: { limit: 20 } });
      setDeposits(res.data.deposits || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get('/deposits/stats');
      setStats(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeposit = async () => {
    if (!telegramId || !amount) {
      setErrorMsg('Telegram ID and amount are required');
      return;
    }
    if (Number(amount) <= 0) {
      setErrorMsg('Amount must be greater than 0');
      return;
    }
    setFormLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await API.post('/deposits', {
        telegram_id: telegramId,
        amount: Number(amount),
        notes,
        type,
      });
      setSuccessMsg(`✅ Deposited ${Number(amount).toLocaleString()} ETB — TX: ${res.data.transactionId}`);
      setTelegramId('');
      setAmount('');
      setNotes('');
      fetchDeposits();
      fetchStats();
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.message || 'Deposit failed');
    } finally {
      setFormLoading(false);
    }
  };

  const fmt = (n: number) => new Intl.NumberFormat('en-US').format(n);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="font-rajdhani font-bold text-3xl tracking-wider" style={{ color: 'var(--neon-cyan)' }}>
          DEPOSITS
        </h1>
        <p className="font-mono-tech text-xs mt-1" style={{ color: '#3a4570' }}>
          BALANCE MANAGEMENT
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'TODAY', val: stats.today.total, count: stats.today.count, color: 'var(--neon-green)' },
            { label: 'THIS WEEK', val: stats.week.total, count: stats.week.count, color: 'var(--neon-cyan)' },
            { label: 'THIS MONTH', val: stats.month.total, count: stats.month.count, color: 'var(--neon-purple)' },
            { label: 'ALL TIME', val: stats.total.total, count: stats.total.count, color: 'var(--neon-orange)' },
          ].map(s => (
            <div key={s.label} className="cyber-card p-4" style={{ borderColor: `${s.color}20` }}>
              <div className="font-rajdhani font-bold text-xs tracking-widest mb-1" style={{ color: '#4a5580' }}>
                {s.label}
              </div>
              <div className="font-mono-tech text-xl font-bold" style={{ color: s.color }}>
                {fmt(s.val)}
              </div>
              <div className="font-exo text-xs mt-0.5" style={{ color: '#3a4570' }}>
                ETB · {s.count} txns
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Form */}
        <div className="cyber-card p-6">
          <h2 className="font-rajdhani font-bold text-xl tracking-wider mb-5" style={{ color: '#a0b4e0' }}>
            ADD DEPOSIT
          </h2>

          {successMsg && (
            <div className="mb-4 p-3 rounded text-sm font-exo" style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.25)', color: 'var(--neon-green)' }}>
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="mb-4 p-3 rounded text-sm font-exo" style={{ background: 'rgba(255,0,128,0.08)', border: '1px solid rgba(255,0,128,0.25)', color: 'var(--neon-pink)' }}>
              ⚠ {errorMsg}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block font-rajdhani font-bold text-xs mb-2 tracking-widest" style={{ color: '#4a5580' }}>
                TELEGRAM ID *
              </label>
              <input
                className="cyber-input"
                placeholder="e.g. 123456789"
                value={telegramId}
                onChange={(e) => setTelegramId(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-rajdhani font-bold text-xs mb-2 tracking-widest" style={{ color: '#4a5580' }}>
                AMOUNT (ETB) *
              </label>
              <input
                className="cyber-input"
                placeholder="e.g. 500"
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-rajdhani font-bold text-xs mb-2 tracking-widest" style={{ color: '#4a5580' }}>
                TYPE
              </label>
              <select
                className="cyber-input"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="manual">Manual</option>
                <option value="refund">Refund</option>
                <option value="bonus">Bonus</option>
                <option value="adjustment">Adjustment</option>
              </select>
            </div>

            <div>
              <label className="block font-rajdhani font-bold text-xs mb-2 tracking-widest" style={{ color: '#4a5580' }}>
                NOTES (OPTIONAL)
              </label>
              <textarea
                className="cyber-input"
                rows={2}
                placeholder="Reference or notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ resize: 'none' }}
              />
            </div>

            <button
              onClick={handleDeposit}
              disabled={formLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
              style={{
                padding: '14px',
                fontSize: '15px',
                background: 'linear-gradient(135deg, rgba(0,255,136,0.2), rgba(0,255,136,0.1))',
                borderColor: 'rgba(0,255,136,0.4)',
                color: 'var(--neon-green)',
              }}
            >
              {formLoading ? (
                <><div className="cyber-spinner" style={{ width: 18, height: 18, borderTopColor: 'var(--neon-green)' }} /> PROCESSING...</>
              ) : '◎ PROCESS DEPOSIT'}
            </button>
          </div>
        </div>

        {/* Recent Deposits */}
        <div className="cyber-card overflow-hidden">
          <div className="p-4" style={{ borderBottom: '1px solid rgba(0,245,255,0.06)' }}>
            <h2 className="font-rajdhani font-bold text-xl tracking-wider" style={{ color: '#a0b4e0' }}>
              RECENT DEPOSITS
            </h2>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="cyber-spinner" />
            </div>
          ) : (
            <div className="overflow-y-auto" style={{ maxHeight: '460px' }}>
              {deposits.length === 0 ? (
                <div className="text-center py-12 font-mono-tech text-xs" style={{ color: '#3a4570' }}>
                  NO DEPOSITS
                </div>
              ) : deposits.map(d => (
                <div key={d._id} className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(0,245,255,0.04)' }}>
                  <div>
                    <div className="font-mono-tech text-xs" style={{ color: 'var(--neon-cyan)' }}>
                      {d.telegram_id}
                    </div>
                    <div className="font-exo text-xs mt-0.5" style={{ color: '#4a5580' }}>
                      {d.reference} · {d.type}
                    </div>
                    <div className="font-exo text-xs" style={{ color: '#3a4570' }}>
                      by {d.admin} · {new Date(d.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono-tech text-sm font-bold" style={{ color: 'var(--neon-green)' }}>
                      +{d.amount.toLocaleString()}
                    </div>
                    <div className="font-exo text-xs" style={{ color: '#3a4570' }}>ETB</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Deposit;
