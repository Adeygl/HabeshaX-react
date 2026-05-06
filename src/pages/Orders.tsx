import React, { useEffect, useMemo, useState } from 'react';
import { API } from '../App';

interface Order {
  _id: string;
  order_id: string;
  telegram_id: string;
  game: string;
  game_icon?: string;
  player_id: string;
  server_id?: string;
  package_name: string;
  sell_price: number;
  status: string;
  payment_status: string;
  topup_status?: string;
  created_at: string;
  processed_by?: string;
  notes?: string;
}

type CanonicalStatus = 'pending' | 'processing' | 'delivered' | 'declined' | 'cancelled' | 'unknown';

const LIMIT = 15;

const normalizeStatus = (status?: string): CanonicalStatus => {
  const s = (status || '').toLowerCase();

  if (s === 'pending_manual' || s === 'pending') return 'pending';
  if (s === 'paid' || s === 'processing') return 'processing';
  if (s === 'completed' || s === 'delivered') return 'delivered';
  if (s === 'declined' || s === 'rejected') return 'declined';
  if (s === 'cancelled' || s === 'canceled') return 'cancelled';

  return 'unknown';
};

const matchesSelectedStatus = (rawStatus: string, selected: string) => {
  if (!selected) return true;

  const s = (rawStatus || '').toLowerCase();

  switch (selected) {
    case 'pending':
      return ['pending', 'pending_manual'].includes(s);
    case 'processing':
      return ['processing', 'paid'].includes(s);
    case 'delivered':
      return ['delivered', 'completed'].includes(s);
    case 'declined':
      return ['declined', 'rejected'].includes(s);
    case 'cancelled':
      return ['cancelled', 'canceled'].includes(s);
    default:
      return true;
  }
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const normalized = normalizeStatus(status);

  return <span className={`badge badge-${normalized}`}>{normalized.toUpperCase()}</span>;
};

const Orders: React.FC = () => {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [actionModal, setActionModal] = useState<{ type: 'approve' | 'decline'; order: Order } | null>(null);
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await API.get('/orders', {
        params: {
          page: 1,
          limit: 500,
          sort: '-created_at',
        },
      });

      setAllOrders(res.data.orders || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();

    return allOrders.filter((o) => {
      const statusOk = matchesSelectedStatus(o.status, statusFilter);

      const searchOk =
        !q ||
        o.order_id?.toLowerCase().includes(q) ||
        o.telegram_id?.toLowerCase().includes(q) ||
        o.game?.toLowerCase().includes(q) ||
        o.package_name?.toLowerCase().includes(q) ||
        o.player_id?.toLowerCase().includes(q) ||
        o.status?.toLowerCase().includes(q) ||
        o.payment_status?.toLowerCase().includes(q) ||
        o.topup_status?.toLowerCase().includes(q) ||
        o.processed_by?.toLowerCase().includes(q);

      return statusOk && searchOk;
    });
  }, [allOrders, search, statusFilter]);

  const total = filteredOrders.length;
  const pages = Math.max(1, Math.ceil(total / LIMIT));

  const pagedOrders = useMemo(() => {
    const start = (page - 1) * LIMIT;
    return filteredOrders.slice(start, start + LIMIT);
  }, [filteredOrders, page]);

  useEffect(() => {
    if (page > pages) setPage(1);
  }, [pages, page]);

  const handleApprove = async () => {
    if (!actionModal) return;

    setActionLoading(true);
    try {
      await API.post('/orders/approve', {
        order_id: actionModal.order.order_id,
        notes: reason,
      });

      setActionModal(null);
      setReason('');
      await fetchOrders();
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Error approving order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!actionModal) return;

    setActionLoading(true);
    try {
      await API.post('/orders/decline', {
        order_id: actionModal.order.order_id,
        reason: reason || 'Technical issue',
        notes: reason,
      });

      setActionModal(null);
      setReason('');
      await fetchOrders();
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Error declining order');
    } finally {
      setActionLoading(false);
    }
  };

  const canTakeAction = (order: Order) => {
    const raw = (order.status || '').toLowerCase();
    const payment = (order.payment_status || '').toLowerCase();

    return (
      ['pending', 'pending_manual', 'paid', 'processing'].includes(raw) &&
      ['completed', 'paid', 'success'].includes(payment)
    );
  };

  const displayStatus = (status: string) => normalizeStatus(status);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-rajdhani font-bold text-3xl tracking-wider" style={{ color: 'var(--neon-cyan)' }}>
            ORDERS
          </h1>
          <p className="font-mono-tech text-xs mt-1" style={{ color: '#3a4570' }}>
            {total} TOTAL RECORDS
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="cyber-card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="cyber-input flex-1"
            placeholder="Search order ID, telegram ID, game..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <select
            className="cyber-input"
            style={{ width: 'auto', minWidth: '160px' }}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="delivered">Delivered</option>
            <option value="declined">Declined</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            className="btn-primary"
            onClick={() => {
              setPage(1);
              fetchOrders();
            }}
          >
            REFRESH
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="cyber-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="cyber-spinner mx-auto" />
              <p className="mt-3 font-mono-tech text-xs" style={{ color: '#3a4570' }}>
                LOADING...
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>ORDER ID</th>
                  <th>USER</th>
                  <th>GAME</th>
                  <th>PACKAGE</th>
                  <th>AMOUNT</th>
                  <th>STATUS</th>
                  <th>DATE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {pagedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 font-mono-tech" style={{ color: '#3a4570' }}>
                      NO ORDERS FOUND
                    </td>
                  </tr>
                ) : (
                  pagedOrders.map((o) => {
                    const normalized = displayStatus(o.status);
                    const showActions = canTakeAction(o);

                    return (
                      <tr key={o._id} className="cursor-pointer" onClick={() => setSelectedOrder(o)}>
                        <td>
                          <span className="font-mono-tech text-xs" style={{ color: 'var(--neon-cyan)' }}>
                            {o.order_id}
                          </span>
                        </td>

                        <td>
                          <span className="font-mono-tech text-xs" style={{ color: '#6b7db5' }}>
                            {o.telegram_id}
                          </span>
                        </td>

                        <td>
                          <div className="flex items-center gap-2">
                            {o.game_icon && <span>{o.game_icon}</span>}
                            <span className="font-exo text-sm">{o.game}</span>
                          </div>
                        </td>

                        <td className="text-xs" style={{ color: '#8090b0' }}>
                          {o.package_name}
                        </td>

                        <td>
                          <span className="font-mono-tech text-sm" style={{ color: 'var(--neon-green)' }}>
                            {Number(o.sell_price || 0).toLocaleString()} ETB
                          </span>
                        </td>

                        <td>
                          <StatusBadge status={o.status} />
                          <div className="mt-1 text-[10px]" style={{ color: '#4a5580' }}>
                            {normalized.toUpperCase()}
                          </div>
                        </td>

                        <td className="font-mono-tech text-xs" style={{ color: '#4a5580' }}>
                          {o.created_at ? new Date(o.created_at).toLocaleDateString() : '-'}
                        </td>

                        <td onClick={(e) => e.stopPropagation()}>
                          {showActions ? (
                            <div className="flex gap-2">
                              <button
                                className="btn-success"
                                style={{ padding: '4px 10px', fontSize: '11px' }}
                                onClick={() => {
                                  setReason('');
                                  setActionModal({ type: 'approve', order: o });
                                }}
                              >
                                ✓
                              </button>
                              <button
                                className="btn-danger"
                                style={{ padding: '4px 10px', fontSize: '11px' }}
                                onClick={() => {
                                  setReason('');
                                  setActionModal({ type: 'decline', order: o });
                                }}
                              >
                                ✗
                              </button>
                            </div>
                          ) : normalized === 'delivered' || normalized === 'declined' ? (
                            <span className="font-mono-tech text-xs" style={{ color: '#3a4570' }}>
                              {o.processed_by || 'DONE'}
                            </span>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderTop: '1px solid rgba(0,245,255,0.06)' }}
          >
            <span className="font-mono-tech text-xs" style={{ color: '#3a4570' }}>
              PAGE {page} / {pages}
            </span>

            <div className="flex gap-2">
              <button
                className="btn-primary"
                style={{ padding: '6px 14px', fontSize: '11px' }}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← PREV
              </button>
              <button
                className="btn-primary"
                style={{ padding: '6px 14px', fontSize: '11px' }}
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
              >
                NEXT →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="cyber-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="cyber-modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-rajdhani font-bold text-xl tracking-wider" style={{ color: 'var(--neon-cyan)' }}>
                ORDER DETAILS
              </h2>
              <button onClick={() => setSelectedOrder(null)} style={{ color: '#4a5580', fontSize: '20px' }}>
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Order ID', value: selectedOrder.order_id, mono: true },
                { label: 'Telegram ID', value: selectedOrder.telegram_id, mono: true },
                { label: 'Game', value: selectedOrder.game },
                { label: 'Player ID', value: selectedOrder.player_id, mono: true },
                { label: 'Package', value: selectedOrder.package_name },
                { label: 'Amount', value: `${Number(selectedOrder.sell_price || 0).toLocaleString()} ETB` },
                { label: 'Status', value: `${displayStatus(selectedOrder.status)} (raw: ${selectedOrder.status})` },
                { label: 'Payment', value: selectedOrder.payment_status },
                { label: 'Topup', value: selectedOrder.topup_status || '-' },
                { label: 'Notes', value: selectedOrder.notes || '-' },
                { label: 'Processed by', value: selectedOrder.processed_by || '-' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between items-center py-1"
                  style={{ borderBottom: '1px solid rgba(0,245,255,0.05)' }}
                >
                  <span className="font-rajdhani font-bold text-xs tracking-wider" style={{ color: '#4a5580' }}>
                    {item.label}
                  </span>
                  <span
                    className={item.mono ? 'font-mono-tech text-sm' : 'font-exo text-sm'}
                    style={{ color: '#c0cce8' }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex gap-3">
              {canTakeAction(selectedOrder) && (
                <>
                  <button
                    className="btn-success flex-1"
                    onClick={() => {
                      setSelectedOrder(null);
                      setActionModal({ type: 'approve', order: selectedOrder });
                    }}
                  >
                    ✓ APPROVE
                  </button>
                  <button
                    className="btn-danger flex-1"
                    onClick={() => {
                      setSelectedOrder(null);
                      setActionModal({ type: 'decline', order: selectedOrder });
                    }}
                  >
                    ✗ DECLINE
                  </button>
                </>
              )}
              <button className="btn-primary flex-1" onClick={() => setSelectedOrder(null)}>
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {actionModal && (
        <div className="cyber-modal-overlay">
          <div className="cyber-modal">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl">{actionModal.type === 'approve' ? '✅' : '❌'}</span>
              <h2
                className="font-rajdhani font-bold text-xl tracking-wider"
                style={{
                  color: actionModal.type === 'approve' ? 'var(--neon-green)' : 'var(--neon-pink)',
                }}
              >
                {actionModal.type === 'approve' ? 'APPROVE ORDER' : 'DECLINE ORDER'}
              </h2>
            </div>

            <div
              className="mb-4 p-3 rounded"
              style={{ background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.1)' }}
            >
              <div className="font-mono-tech text-xs" style={{ color: 'var(--neon-cyan)' }}>
                {actionModal.order.order_id}
              </div>
              <div className="font-exo text-sm mt-1" style={{ color: '#a0b4e0' }}>
                {actionModal.order.game} — {Number(actionModal.order.sell_price || 0).toLocaleString()} ETB
              </div>
            </div>

            {actionModal.type === 'decline' && (
              <div
                className="mb-4 p-3 rounded text-sm"
                style={{
                  background: 'rgba(255,0,128,0.06)',
                  border: '1px solid rgba(255,0,128,0.15)',
                  color: '#ff0080',
                }}
              >
                ↩ A refund of <strong>{Number(actionModal.order.sell_price || 0).toLocaleString()} ETB</strong> will be
                issued to the user.
              </div>
            )}

            <div className="mb-5">
              <label className="block font-rajdhani font-bold text-xs mb-2 tracking-widest" style={{ color: '#4a5580' }}>
                {actionModal.type === 'approve' ? 'NOTES (OPTIONAL)' : 'DECLINE REASON'}
              </label>
              <textarea
                className="cyber-input"
                rows={3}
                placeholder={actionModal.type === 'approve' ? 'Optional notes...' : 'Enter reason for declining...'}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                style={{ resize: 'none' }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={actionModal.type === 'approve' ? handleApprove : handleDecline}
                disabled={actionLoading}
                className={actionModal.type === 'approve' ? 'btn-success flex-1' : 'btn-danger flex-1'}
                style={{ padding: '12px' }}
              >
                {actionLoading ? 'PROCESSING...' : `CONFIRM ${actionModal.type.toUpperCase()}`}
              </button>
              <button
                onClick={() => {
                  setActionModal(null);
                  setReason('');
                }}
                className="btn-primary flex-1"
                style={{ padding: '12px' }}
                disabled={actionLoading}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;