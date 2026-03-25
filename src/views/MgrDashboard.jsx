import { useState } from 'react';
import { useApp } from '../context/AppContext';
import StatusTag from '../components/shared/StatusTag';
import AuditLog from '../components/shared/AuditLog';
import { ExceptionRequestModal, RequestDetailModal } from '../components/modals/AllModals';

const REQUESTS = [
  { id: 'PC-0041', date: '23 Mar', cat: 'Cleaning', purpose: 'Weekly cleaning supplies', supplier: 'CleanPro', amt: '$180', status: 'review' },
  { id: 'PC-0039', date: '18 Mar', cat: 'Gas', purpose: 'Gas cylinder refill', supplier: 'ZimGas', amt: '$120', status: 'paid', txn: 'IB-TXN-93391' },
  { id: 'PC-0035', date: '12 Mar', cat: 'Maintenance', purpose: 'Door seal repair', supplier: 'Swift Maintenance', amt: '$200', status: 'paid', txn: 'IB-TXN-93350' },
  { id: 'PC-0028', date: '28 Feb', cat: 'Emergency', purpose: 'Emergency plumbing', supplier: 'AquaFix', amt: '$340', status: 'rejected' },
];

const LOGS = [
  { color: 'var(--er)', time: '23 Mar 13:10', text: '<strong>THRESHOLD ALERT</strong> — Sh-14 reached 90% of $800 monthly budget', user: 'System Auto · Notified: Accountant, Brand Manager' },
  { color: 'var(--wa)', time: '23 Mar 08:14', text: '<strong>REQUEST SUBMITTED</strong> — PC-0041 · $180 · Cleaning Supplies · CleanPro', user: 'K. Mutasa (Shop Manager) · Sh-14 Borrowdale' },
  { color: 'var(--ok)', time: '18 Mar 14:30', text: '<strong>PAYMENT RECEIVED</strong> — PC-0039 · $120 · InnBucks TXN-93391', user: 'K. Mutasa (Shop Manager) · ZimGas' },
  { color: 'var(--ok)', time: '12 Mar 11:05', text: '<strong>PAYMENT RECEIVED</strong> — PC-0035 · $200 · InnBucks TXN-93350', user: 'K. Mutasa (Shop Manager) · Swift Maintenance' },
  { color: 'var(--er)', time: '28 Feb 09:00', text: '<strong>REQUEST REJECTED</strong> — PC-0028 · $340 · Amount exceeded budget limit', user: 'C. Mutandwa (Brand Accountant) · Pizza Inn' },
];

export default function MgrDashboard() {
  const { openModal, modals, closeModal, navigate } = useApp();
  const [viewRequest, setViewRequest] = useState(null);
  const [showExc, setShowExc] = useState(false);

  return (
    <>
      <div className="ph">
        <div className="bc">CVS <span>/</span> Chicken Inn <span>/</span> Sh-14 Borrowdale <span>/</span> Dashboard</div>
        <div className="pt">Good morning, K. Mutasa</div>
        <div className="pd">Chicken Inn — Sh-14 Borrowdale &nbsp;|&nbsp; Tuesday 23 March 2025</div>
      </div>
      <div className="cnt">
        <div className="thresh">
          <div className="thr-ic">🚨</div>
          <div>
            <div className="thr-t">Threshold Alert — Sh-14 Borrowdale at 90% of Monthly Budget</div>
            <div className="thr-d">Monthly spend: <strong>$720 of $800</strong>. Cleaning Supplies category at <strong>$280 of $300 cap</strong>. New requests require exception approval. Brand Accountant and Brand Manager have been notified.</div>
            <div className="thr-acts">
              <button className="ab sec" style={{ height: 30, fontSize: 11 }} onClick={() => setShowExc(true)}>Request Exception</button>
            </div>
          </div>
        </div>

        <div className="kg c4">
          <div className="kc bl"><div className="kl">Monthly Budget — Sh-14</div><div className="kv">$800</div><div className="kd nt">Chicken Inn Sh-14 limit</div><div className="ki">💳</div></div>
          <div className="kc rd"><div className="kl">Spent This Month</div><div className="kv">$720</div><div className="kd dn">⚠ 90% used — threshold active</div><div className="ki">📊</div></div>
          <div className="kc yw"><div className="kl">Pending Approval</div><div className="kv">$180</div><div className="kd nt">1 request awaiting review</div><div className="ki">⏳</div></div>
          <div className="kc gn"><div className="kl">Available Balance</div><div className="kv">$80</div><div className="kd dn">Low — monitor spend</div><div className="ki">✓</div></div>
        </div>

        <div className="tbbar">
          <div className="tbt">My Requests — Sh-14 Borrowdale</div>
          <button className="ab pri" onClick={() => navigate({ v: 'mgr-new-request', lb: 'New Request' }, 1)}>+ New Request</button>
        </div>
        <table className="dt">
          <thead><tr><th>Request ID</th><th>Date</th><th>Category</th><th>Purpose</th><th>Supplier</th><th>Amount</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {REQUESTS.map(r => (
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

        <div style={{ height: 20 }} />
        <AuditLog title="Audit Log — Sh-14 Borrowdale (My Activity)" entries={LOGS} />
      </div>

      <ExceptionRequestModal open={showExc} onClose={() => setShowExc(false)} />
      <RequestDetailModal request={viewRequest} onClose={() => setViewRequest(null)} />
    </>
  );
}
