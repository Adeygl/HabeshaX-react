import React, { useState } from 'react';
import { API } from '../App';

const SendMessage: React.FC = () => {
  const [mode, setMode] = useState<'single' | 'broadcast'>('single');
  const [telegramId, setTelegramId] = useState('');
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; msg: string } | null>(null);

  const handleSend = async () => {
    if (!message.trim()) {
      setResult({ success: false, msg: 'Message is required' });
      return;
    }
    if (mode === 'single' && !telegramId.trim()) {
      setResult({ success: false, msg: 'Telegram ID is required' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      if (mode === 'single') {
        await API.post('/notifications/send', {
          telegram_id: telegramId,
          message,
          image_url: imageUrl || undefined,
        });
        setResult({ success: true, msg: 'Message sent successfully!' });
      } else {
        const res = await API.post('/notifications/broadcast', {
          message,
          image_url: imageUrl || undefined,
        });
        setResult({
          success: true,
          msg: `Broadcast complete — ${res.data.successCount} sent, ${res.data.failedCount} failed`,
        });
      }
      setMessage('');
      setTelegramId('');
      setImageUrl('');
    } catch (e: any) {
      setResult({ success: false, msg: e?.response?.data?.message || 'Send failed' });
    } finally {
      setLoading(false);
    }
  };

  const QUICK_TEMPLATES = [
    { label: 'Maintenance', text: '🔧 <b>SCHEDULED MAINTENANCE</b>\n\nWe will be performing maintenance shortly. Service may be temporarily unavailable.\n\nApologies for any inconvenience. 🙏' },
    { label: 'Promotion', text: '🎉 <b>SPECIAL OFFER!</b>\n\n💰 Get a 10% bonus on your next deposit!\n\n⏰ Limited time only. Act now! 🔥' },
    { label: 'Back Online', text: '✅ <b>SERVICE RESTORED</b>\n\nAll systems are back online. Thank you for your patience! 😎🎮' },
    { label: 'Welcome', text: '👋 <b>Welcome to HabeshaX!</b>\n\nThank you for joining. Top up your favorite games at the best prices. 🎮⭐' },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="font-rajdhani font-bold text-3xl tracking-wider" style={{ color: 'var(--neon-cyan)' }}>
          BROADCAST
        </h1>
        <p className="font-mono-tech text-xs mt-1" style={{ color: '#3a4570' }}>
          TELEGRAM NOTIFICATION CENTER
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2">
        {(['single', 'broadcast'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className="font-rajdhani font-bold tracking-wider px-5 py-2 rounded text-sm transition-all"
            style={mode === m ? {
              background: 'rgba(0,245,255,0.1)',
              border: '1px solid rgba(0,245,255,0.3)',
              color: 'var(--neon-cyan)',
            } : {
              background: 'transparent',
              border: '1px solid rgba(0,245,255,0.08)',
              color: '#4a5580',
            }}
          >
            {m === 'single' ? '◉ SINGLE USER' : '◈ BROADCAST ALL'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Compose */}
        <div className="cyber-card p-6 lg:col-span-2">
          <h2 className="font-rajdhani font-bold text-xl tracking-wider mb-5" style={{ color: '#a0b4e0' }}>
            COMPOSE MESSAGE
          </h2>

          {result && (
            <div
              className="mb-4 p-3 rounded text-sm font-exo"
              style={{
                background: result.success ? 'rgba(0,255,136,0.08)' : 'rgba(255,0,128,0.08)',
                border: `1px solid ${result.success ? 'rgba(0,255,136,0.25)' : 'rgba(255,0,128,0.25)'}`,
                color: result.success ? 'var(--neon-green)' : 'var(--neon-pink)',
              }}
            >
              {result.success ? '✓' : '⚠'} {result.msg}
            </div>
          )}

          <div className="space-y-4">
            {mode === 'single' && (
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
            )}

            {mode === 'broadcast' && (
              <div className="p-3 rounded" style={{ background: 'rgba(255,107,0,0.08)', border: '1px solid rgba(255,107,0,0.2)' }}>
                <p className="font-exo text-sm" style={{ color: 'var(--neon-orange)' }}>
                  ⚠ This will send a message to <strong>ALL registered users</strong>.
                </p>
              </div>
            )}

            <div>
              <label className="block font-rajdhani font-bold text-xs mb-2 tracking-widest" style={{ color: '#4a5580' }}>
                MESSAGE * <span style={{ color: '#2a3555', fontWeight: 400 }}>— HTML tags supported</span>
              </label>
              <textarea
                className="cyber-input"
                rows={7}
                placeholder="Write your message here... You can use <b>bold</b>, <i>italic</i> HTML tags"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ resize: 'vertical', fontFamily: "'Share Tech Mono', monospace", fontSize: '13px' }}
              />
              <div className="mt-1 font-mono-tech text-xs text-right" style={{ color: '#2a3555' }}>
                {message.length} chars
              </div>
            </div>

            <div>
              <label className="block font-rajdhani font-bold text-xs mb-2 tracking-widest" style={{ color: '#4a5580' }}>
                IMAGE URL (OPTIONAL)
              </label>
              <input
                className="cyber-input"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>

            <button
              onClick={handleSend}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
              style={{ padding: '14px', fontSize: '15px' }}
            >
              {loading ? (
                <><div className="cyber-spinner" style={{ width: 18, height: 18 }} /> SENDING...</>
              ) : mode === 'broadcast' ? '◈ BROADCAST TO ALL' : '◉ SEND MESSAGE'}
            </button>
          </div>
        </div>

        {/* Templates */}
        <div className="cyber-card p-5">
          <h2 className="font-rajdhani font-bold text-xl tracking-wider mb-4" style={{ color: '#a0b4e0' }}>
            QUICK TEMPLATES
          </h2>
          <div className="space-y-2">
            {QUICK_TEMPLATES.map(t => (
              <button
                key={t.label}
                onClick={() => setMessage(t.text)}
                className="w-full text-left p-3 rounded transition-all"
                style={{
                  background: 'rgba(0,245,255,0.03)',
                  border: '1px solid rgba(0,245,255,0.08)',
                  color: '#8090b0',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,245,255,0.2)';
                  (e.currentTarget as HTMLElement).style.color = '#a0b4e0';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,245,255,0.08)';
                  (e.currentTarget as HTMLElement).style.color = '#8090b0';
                }}
              >
                <div className="font-rajdhani font-bold text-xs tracking-wider mb-1" style={{ color: 'var(--neon-cyan)', opacity: 0.7 }}>
                  {t.label}
                </div>
                <div className="font-exo text-xs line-clamp-2">
                  {t.text.replace(/<[^>]+>/g, '').substring(0, 80)}...
                </div>
              </button>
            ))}
          </div>

          <div className="mt-5 p-3 rounded" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(0,245,255,0.06)' }}>
            <div className="font-rajdhani font-bold text-xs tracking-widest mb-2" style={{ color: '#4a5580' }}>
              HTML FORMATTING
            </div>
            {[
              ['<b>text</b>', 'Bold'],
              ['<i>text</i>', 'Italic'],
              ['<code>text</code>', 'Code'],
              ['<u>text</u>', 'Underline'],
            ].map(([tag, desc]) => (
              <div key={tag} className="flex justify-between mb-1">
                <code className="font-mono-tech text-xs" style={{ color: 'var(--neon-cyan)', opacity: 0.6 }}>{tag}</code>
                <span className="font-exo text-xs" style={{ color: '#4a5580' }}>{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendMessage;
