import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import StatusTag from '../components/shared/StatusTag';
import Breadcrumbs from '../components/shared/Breadcrumbs';
import EndpointPendingBanner from '../components/shared/EndpointPendingBanner';
import { ExceptionRequestModal, RequestDetailModal } from '../components/modals/AllModals';
import { listProcurementRequests } from '../lib/cvsApi';

// Map a paginated /procurement/requests record into the row shape the table renders.
const toRow = (r) => ({
  id: r.id,
  date: (r.created_at || '').slice(0, 10),
  cat: r.category?.name || r.category_name || '—',
  purpose: r.description || r.purpose || '—',
  supplier: r.supplier?.name || r.supplier_name || '—',
  amt: r.amount != null ? `$${Number(r.amount).toFixed(2)}` : '—',
  status: r.status || 'pending',
});

export default function MgrDashboard() {
  const { session, navigate } = useApp();
  const [viewRequest, setViewRequest] = useState(null);
  const [showExc, setShowExc] = useState(false);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;
    listProcurementRequests()
      .then((list) => {
        if (cancelled) return;
        setRows(Array.isArray(list) ? list.map(toRow) : []);
      })
      .catch((err) => !cancelled && setLoadError(err?.response?.data?.message || err.message || 'Failed to load requests'))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  const pendingCount = rows.filter(r => r.status === 'pending' || r.status === 'submitted').length;

  return (
    <>
      <div className="ph">
        <Breadcrumbs items={[
          { label: 'CVS' },
          { label: session?.brand || '—' },
          { label: 'Dashboard' },
        ]} />
      </div>
      <div className="cnt">
        <EndpointPendingBanner
          feature="Shop budget metrics (Monthly Budget / Spent / Available)"
          endpoints={['GET /api/v1/budgets?shop_id=:id (shop scope)']}
          note="`/budgets` ships at brand scope — per-shop budget aggregation isn't exposed yet."
        />
        <div className="kg c4">
          <div className="kc bl"><div className="kl">Monthly Budget</div><div className="kv">—</div><div className="kd nt">—</div><div className="ki">💳</div></div>
          <div className="kc rd"><div className="kl">Spent This Month</div><div className="kv">—</div><div className="kd nt">—</div><div className="ki">📊</div></div>
          <div className="kc yw"><div className="kl">Pending Approval</div><div className="kv">{pendingCount}</div><div className="kd nt">Awaiting accountant / brand manager</div><div className="ki">⏳</div></div>
          <div className="kc gn"><div className="kl">Available Balance</div><div className="kv">—</div><div className="kd nt">—</div><div className="ki">✓</div></div>
        </div>

        <div className="tbbar">
          <div className="tbt">My Requests</div>
          <button className="ab pri" onClick={() => navigate({ v: 'mgr-new-request', lb: 'New Request' }, 1)}>+ New Request</button>
        </div>
        <table className="dt">
          <thead><tr><th>Request ID</th><th>Date</th><th>Category</th><th>Purpose</th><th>Supplier</th><th>Amount</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--ts)', padding: 20 }}>Loading…</td></tr>
            ) : loadError ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--er-t)', padding: 20 }}>{loadError}</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--ts)', padding: 20 }}>No requests yet.</td></tr>
            ) : rows.map(r => (
              <tr key={r.id}>
                <td><code style={{ color: 'var(--info)', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11 }}>{r.id}</code></td>
                <td style={{ color: 'var(--ts)', fontSize: 12 }}>{r.date}</td>
                <td>{r.cat}</td>
                <td>{r.purpose}</td>
                <td>{r.supplier}</td>
                <td><strong>{r.amt}</strong></td>
                <td><StatusTag type={r.status} /></td>
                <td><button className="rb vw" onClick={() => setViewRequest(r)}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>

      <ExceptionRequestModal open={showExc} onClose={() => setShowExc(false)} />
      <RequestDetailModal request={viewRequest} onClose={() => setViewRequest(null)} />
    </>
  );
}
