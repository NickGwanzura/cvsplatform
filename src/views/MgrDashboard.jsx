import { useState } from 'react';
import { useApp } from '../context/AppContext';
import StatusTag from '../components/shared/StatusTag';
import Breadcrumbs from '../components/shared/Breadcrumbs';
import { ExceptionRequestModal, RequestDetailModal } from '../components/modals/AllModals';

const REQUESTS = [];

export default function MgrDashboard() {
  const { session, openModal, modals, closeModal, navigate } = useApp();
  const [viewRequest, setViewRequest] = useState(null);
  const [showExc, setShowExc] = useState(false);

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
        <div className="kg c4">
          <div className="kc bl"><div className="kl">Monthly Budget</div><div className="kv">—</div><div className="kd nt">—</div><div className="ki">💳</div></div>
          <div className="kc rd"><div className="kl">Spent This Month</div><div className="kv">—</div><div className="kd nt">—</div><div className="ki">📊</div></div>
          <div className="kc yw"><div className="kl">Pending Approval</div><div className="kv">—</div><div className="kd nt">—</div><div className="ki">⏳</div></div>
          <div className="kc gn"><div className="kl">Available Balance</div><div className="kv">—</div><div className="kd nt">—</div><div className="ki">✓</div></div>
        </div>

        <div className="tbbar">
          <div className="tbt">My Requests</div>
          <button className="ab pri" onClick={() => navigate({ v: 'mgr-new-request', lb: 'New Request' }, 1)}>+ New Request</button>
        </div>
        <table className="dt">
          <thead><tr><th>Request ID</th><th>Date</th><th>Category</th><th>Purpose</th><th>Supplier</th><th>Amount</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {REQUESTS.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--ts)', padding: 20 }}>No requests yet.</td></tr>
            ) : REQUESTS.map(r => (
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
