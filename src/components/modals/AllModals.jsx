import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import CvsModal from './CvsModal';
import StatusTag from '../shared/StatusTag';
import BrandChip from '../shared/BrandChip';
import { BRANDS } from '../../data/mockData';

/* ── Request Detail Modal ───────────────────────────────────────────────── */
export function RequestDetailModal({ request, onClose }) {
  if (!request) return null;
  return (
    <CvsModal open={!!request} onClose={onClose} title={`Request Detail — ${request.id}`} subtitle={`${request.cat} · ${request.supplier}`}
      footer={<button className="ab pri" style={{ height: 42, padding: '0 20px' }} onClick={onClose}>Close</button>}
    >
      {[
        { label: 'Request ID', value: <code style={{ color: 'var(--info)', fontFamily: "'IBM Plex Mono',monospace" }}>{request.id}</code> },
        { label: 'Date Submitted', value: request.date },
        { label: 'Category', value: request.cat },
        { label: 'Purpose', value: request.purpose || '—' },
        { label: 'Supplier', value: request.supplier },
        { label: 'Amount', value: <span style={{ fontWeight: 700, color: 'var(--int)', fontSize: 18, fontFamily: "'IBM Plex Sans Condensed',sans-serif" }}>{request.amt}</span> },
        { label: 'Status', value: <StatusTag type={request.status} /> },
        ...(request.wallet ? [{ label: 'InnBucks Wallet', value: <code style={{ fontFamily: "'IBM Plex Mono',monospace" }}>{request.wallet}</code> }] : []),
        ...(request.txn ? [{ label: 'Transaction Ref', value: <code style={{ color: 'var(--ok-t)', fontFamily: "'IBM Plex Mono',monospace" }}>{request.txn}</code> }] : []),
      ].map((row, i, arr) => (
        <div key={i} className="cvs-detail-row" style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--bs)' : 'none' }}>
          <span className="cvs-detail-label">{row.label}</span>
          <span>{row.value}</span>
        </div>
      ))}
      {request.status === 'rejected' && (
        <div style={{ marginTop: 12, padding: 10, background: 'var(--er-bg)', borderLeft: '3px solid var(--er)' }}>
          <div style={{ fontSize: 11, color: 'var(--er-t)', fontWeight: 600 }}>Rejection Reason</div>
          <div style={{ fontSize: 12, color: 'var(--ts)', marginTop: 3 }}>Amount exceeded monthly budget limit. Request denied by Brand Accountant.</div>
        </div>
      )}
    </CvsModal>
  );
}

/* ── Reject Confirm Modal ───────────────────────────────────────────────── */
export function RejectModal({ open, onClose, requestId, onConfirm }) {
  const [reason, setReason] = useState('');
  return (
    <CvsModal open={open} onClose={onClose} title="Reject Request" subtitle={requestId ? `Rejecting ${requestId}` : 'Confirm rejection'}
      footer={<>
        <button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={onClose}>Cancel</button>
        <button className="ab dan" style={{ height: 42, padding: '0 20px' }} onClick={() => { onConfirm?.(); onClose(); setReason(''); }}>Confirm Rejection</button>
      </>}
    >
      <div style={{ marginBottom: 13, padding: 10, background: 'var(--er-bg)', borderLeft: '3px solid var(--er)' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--er-t)', marginBottom: 3 }}>This action cannot be undone</div>
        <div style={{ fontSize: 12, color: 'var(--ts)' }}>The request will be marked as rejected. The shop manager will be notified.</div>
      </div>
      <label className="fl">Rejection Reason (required)</label>
      <select className="fsel" value={reason} onChange={e => setReason(e.target.value)}>
        <option value="">— Select reason —</option>
        <option>Exceeds budget limit</option>
        <option>Supplier not verified</option>
        <option>Missing documentation</option>
        <option>Duplicate request</option>
        <option>Not operationally justified</option>
        <option>Other</option>
      </select>
    </CvsModal>
  );
}

/* ── Edit User Modal ────────────────────────────────────────────────────── */
export function EditUserModal({ user, onClose }) {
  const { addToast } = useApp();
  if (!user) return null;
  return (
    <CvsModal open={!!user} onClose={onClose} title="Edit User" subtitle={user.email}
      footer={<>
        <button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={onClose}>Cancel</button>
        <button className="ab pri" style={{ height: 42, padding: '0 20px' }} onClick={() => { onClose(); addToast('ok', 'User updated', `${user.name} role updated successfully`); }}>Save Changes</button>
      </>}
    >
      <div className="fg">
        <div className="fi"><label className="fl">Full Name</label><input className="fin" defaultValue={user.name} /></div>
        <div className="fi"><label className="fl">Email</label><input className="fin" type="email" defaultValue={user.email} readOnly /></div>
        <div className="fi">
          <label className="fl">Role</label>
          <select className="fsel" defaultValue={user.roleLabel}>
            {['Shop Manager','Brand Accountant','Brand Manager','Procurement','Executive','Admin'].map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="fi">
          <label className="fl">Brand</label>
          <select className="fsel" defaultValue={user.brand}>
            <option>All Brands</option>
            {BRANDS.map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
      </div>
    </CvsModal>
  );
}

/* ── Revoke User Modal ──────────────────────────────────────────────────── */
export function RevokeUserModal({ user, onClose }) {
  const { addToast } = useApp();
  if (!user) return null;
  return (
    <CvsModal open={!!user} onClose={onClose} title="Revoke Access" subtitle={user.email}
      footer={<>
        <button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={onClose}>Cancel</button>
        <button className="ab dan" style={{ height: 42, padding: '0 20px' }} onClick={() => { onClose(); addToast('ok', 'Access revoked', `${user.name} has been removed from CVS`); }}>Revoke Access</button>
      </>}
    >
      <div style={{ padding: 12, background: 'var(--er-bg)', borderLeft: '3px solid var(--er)', marginBottom: 13 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--er-t)', marginBottom: 3 }}>Revoke system access for {user.name}?</div>
        <div style={{ fontSize: 12, color: 'var(--ts)' }}>This will immediately invalidate their session and block future logins. All their pending actions will be flagged for review.</div>
      </div>
      <div className="cvs-detail-row"><span className="cvs-detail-label">Role</span><span>{user.roleLabel}</span></div>
      <div className="cvs-detail-row"><span className="cvs-detail-label">Brand</span><span>{user.brand}</span></div>
      <div className="cvs-detail-row" style={{ borderBottom: 'none' }}><span className="cvs-detail-label">Email</span><span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{user.email}</span></div>
    </CvsModal>
  );
}

/* ── New Supplier Modal ─────────────────────────────────────────────────── */
export function NewSupplierModal({ open, onClose }) {
  const { addToast } = useApp();
  return (
    <CvsModal open={open} onClose={onClose} title="Register New Supplier" subtitle="New suppliers are reviewed by Procurement before activation"
      footer={<>
        <button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={onClose}>Cancel</button>
        <button className="ab pri" style={{ height: 42, padding: '0 20px' }} onClick={() => { onClose(); addToast('info', 'Supplier registration submitted', 'Procurement will verify within 24–48 hours'); }}>Submit for Review</button>
      </>}
    >
      <div className="fg">
        <div className="fi"><label className="fl">Supplier Name</label><input className="fin" placeholder="Company legal name" /></div>
        <div className="fi"><label className="fl">Trading Name</label><input className="fin" placeholder="If different from legal name" /></div>
        <div className="fi"><label className="fl">Tax / TIN Number</label><input className="fin" placeholder="ZW-TIN-XXXXXXXX" /></div>
        <div className="fi"><label className="fl">Category</label><select className="fsel"><option>Maintenance & Repairs</option><option>Cleaning Supplies</option><option>Gas & Utilities</option><option>Stationery</option><option>Equipment</option><option>Other</option></select></div>
        <div className="fi"><label className="fl">InnBucks Wallet Number</label><input className="fin" placeholder="IB-XXXX-XXXX" /></div>
        <div className="fi"><label className="fl">Contact Phone</label><input className="fin" placeholder="+263 7X XXX XXXX" /></div>
        <div className="fi full"><label className="fl">Business Address</label><input className="fin" placeholder="Street address, City" /></div>
      </div>
      <div style={{ marginTop: 11, padding: 10, background: 'var(--info-bg)', borderLeft: '3px solid var(--int)' }}>
        <div style={{ fontSize: 11, color: 'var(--info)' }}>Procurement will verify supplier credentials and activate within 24–48 hours. You will be notified by email.</div>
      </div>
    </CvsModal>
  );
}

/* ── Pay Modal ──────────────────────────────────────────────────────────── */
export function PayModal({ open, onClose, request }) {
  const { addToast } = useApp();
  const r = request || { mgr: 'K. Mutasa', id: 'PC-0041', wallet: 'IB-0773-8812', amt: '$180.00', supplier: 'CleanPro Supplies', shop: 'Sh-14 Borrowdale' };
  return (
    <CvsModal open={!!open} onClose={onClose} title="Approve & Pay via InnBucks" subtitle={`${r.id} · ${r.mgr} · Chicken Inn ${r.shop}`}
      footer={<>
        <button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={onClose}>Cancel</button>
        <button className="ab pri" style={{ height: 42, padding: '0 20px' }} onClick={() => { onClose(); addToast('ok', 'Payment sent', `${r.amt} disbursed to ${r.wallet} via InnBucks`); }}>
          Confirm &amp; Pay {r.amt}
        </button>
      </>}
    >
      <div className="ibp" style={{ marginBottom: 0 }}>
        <div className="ibh">
          <div className="ibl">InnBucks</div>
          <div><div style={{ fontSize: 13, fontWeight: 600 }}>Cashless Disbursement</div><div className="ibs">API Connected</div></div>
        </div>
        <div className="ps">
          <div><div className="pfl">Recipient</div><div className="pfv">{r.mgr}</div></div>
          <div><div className="pfl">InnBucks Number</div><div className="pfv" style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13 }}>{r.wallet}</div></div>
          <div><div className="pfl">Amount (USD)</div><div className="pfv amt">{r.amt}</div></div>
        </div>
        <div style={{ background: 'var(--l2)', padding: 10 }}>
          <div style={{ fontSize: 10, color: 'var(--ts)', fontFamily: "'IBM Plex Mono',monospace", marginBottom: 3 }}>SUPPLIER / PURPOSE</div>
          <div style={{ fontSize: 13 }}>{r.supplier} · {r.shop}</div>
        </div>
      </div>
      <div style={{ marginTop: 11, padding: 10, background: 'var(--wa-bg)', borderLeft: '3px solid var(--wa)' }}>
        <div style={{ fontSize: 11, color: 'var(--wa-t)', fontWeight: 600 }}>Confirm before disbursing</div>
        <div style={{ fontSize: 11, color: 'var(--ts)', marginTop: 2 }}>Payment is immediate and irreversible. Logged in audit trail.</div>
      </div>
    </CvsModal>
  );
}

/* ── Batch Pay Modal ────────────────────────────────────────────────────── */
export function BatchPayModal({ open, onClose, rows = [] }) {
  const { addToast } = useApp();
  const defaultRows = [
    { id: 'PC-0041', mgr: 'K. Mutasa', shop: 'Sh-14', wallet: 'IB-0773-8812', amt: '$180', type: 'exception' },
    { id: 'PC-0039', mgr: 'P. Chiriseri', shop: 'Sh-07', wallet: 'IB-0771-2244', amt: '$200', type: 'approved' },
    { id: 'PC-0038', mgr: 'M. Dube', shop: 'Sh-22', wallet: 'IB-0774-3344', amt: '$120', type: 'approved' },
  ];
  const displayRows = rows.length > 0 ? rows : defaultRows;
  const total = displayRows.reduce((sum, r) => sum + parseInt(r.amt.replace('$', '')), 0);
  return (
    <CvsModal open={!!open} onClose={onClose} size="lg" title="Batch InnBucks Payment" subtitle="Review and confirm all selected payments"
      footer={<>
        <button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={onClose}>Cancel</button>
        <button className="ab pri" style={{ height: 42, padding: '0 20px' }} onClick={() => { onClose(); addToast('ok', 'Batch payment complete', `${displayRows.length} payments totalling $${total} sent via InnBucks`); }}>
          Confirm Batch Payment — ${total.toFixed(2)}
        </button>
      </>}
    >
      <div style={{ background: 'var(--info-bg)', borderLeft: '3px solid var(--int)', padding: '10px 13px', marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: 'var(--info)', fontWeight: 600 }}>{displayRows.length} requests selected for batch payment</div>
        <div style={{ fontSize: 11, color: 'var(--ts)', marginTop: 2 }}>Total: <strong>${total.toFixed(2)}</strong> · All funds disbursed simultaneously via InnBucks</div>
      </div>
      <table className="dt" style={{ marginBottom: 14 }}>
        <thead><tr><th>ID</th><th>Manager</th><th>Shop</th><th>InnBucks Number</th><th>Amount</th><th>Status</th></tr></thead>
        <tbody>
          {displayRows.map(r => (
            <tr key={r.id}>
              <td><code style={{ color: 'var(--info)', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11 }}>{r.id}</code></td>
              <td>{r.mgr}</td><td>{r.shop}</td>
              <td><code style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11 }}>{r.wallet}</code></td>
              <td><strong>{r.amt}</strong></td>
              <td><StatusTag type={r.type} /></td>
            </tr>
          ))}
          <tr style={{ background: 'var(--l2)' }}>
            <td colSpan={4}><strong>TOTAL</strong></td>
            <td><strong>${total.toFixed(2)}</strong></td><td></td>
          </tr>
        </tbody>
      </table>
      {displayRows.some(r => r.type === 'exception') && (
        <div style={{ padding: 10, background: 'var(--wa-bg)', borderLeft: '3px solid var(--wa)' }}>
          <div style={{ fontSize: 11, color: 'var(--wa-t)', fontWeight: 600 }}>Batch includes exception approvals. These will be logged in the audit trail.</div>
        </div>
      )}
    </CvsModal>
  );
}

/* ── Validate Modal ─────────────────────────────────────────────────────── */
export function ValidateModal({ open, onClose, request }) {
  const { addToast } = useApp();
  const [adjustedAmt, setAdjustedAmt] = useState(request?.rawAmt || 450);
  const [notes, setNotes] = useState('');
  const r = request || { id: 'PC-0044', mgr: 'T. Ndlovu', supplier: 'OvenPro Zimbabwe', rawAmt: 450, budgetStatus: 'over' };
  return (
    <CvsModal open={!!open} onClose={onClose} title="Validate Request" subtitle="Forward to Brand Manager for approval"
      footer={<>
        <button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={onClose}>Cancel</button>
        <button className="ab pri" style={{ height: 42, padding: '0 20px' }} onClick={() => {
          onClose();
          const adjusted = adjustedAmt !== r.rawAmt ? ` (adjusted from $${r.rawAmt} to $${adjustedAmt})` : '';
          addToast('ok', `${r.id} validated${adjusted}`, 'Forwarded to Brand Manager for approval');
        }}>Forward to Brand Manager</button>
      </>}
    >
      {[
        { label: 'Manager', value: r.mgr },
        { label: 'Supplier', value: r.supplier },
        { label: 'Amount Requested', value: <span style={{ fontWeight: 700, color: 'var(--int)', fontSize: 16, fontFamily: "'IBM Plex Sans Condensed',sans-serif" }}>${r.rawAmt}.00</span> },
        { label: 'Budget Status', value: r.budgetStatus === 'over' ? <span style={{ color: 'var(--er)', fontWeight: 600 }}>Over limit — exception required</span> : <span style={{ color: 'var(--ok-t)', fontWeight: 600 }}>Within limit</span> },
      ].map((row, i, arr) => (
        <div key={i} className="cvs-detail-row" style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--bs)' : 'none' }}>
          <span className="cvs-detail-label">{row.label}</span><span>{row.value}</span>
        </div>
      ))}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 13 }}>
        <div>
          <label className="fl">Adjusted Amount (USD)</label>
          <input className="fin" type="number" value={adjustedAmt} onChange={e => setAdjustedAmt(+e.target.value)} />
          {adjustedAmt !== r.rawAmt && <div className="fh" style={{ color: 'var(--wa-t)' }}>Adjusted from ${r.rawAmt} to ${adjustedAmt}</div>}
        </div>
        <div>
          <label className="fl">Notes for Brand Manager</label>
          <input className="fin" type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional note" />
        </div>
      </div>
    </CvsModal>
  );
}

/* ── Exception Request Modal (Manager) ──────────────────────────────────── */
export function ExceptionRequestModal({ open, onClose }) {
  const { addToast } = useApp();
  const [reason, setReason] = useState('');
  return (
    <CvsModal open={!!open} onClose={onClose} title="Request Exception Approval" subtitle="PC-0041 · Sh-14 over monthly threshold"
      footer={<>
        <button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={onClose}>Cancel</button>
        <button className="ab pri" style={{ height: 42, padding: '0 20px' }} disabled={!reason.trim()}
          onClick={() => { onClose(); addToast('wa', 'Exception request submitted', 'Awaiting Brand Manager approval'); setReason(''); }}>
          Submit Exception Request
        </button>
      </>}
    >
      <div style={{ background: 'var(--er-bg)', borderLeft: '3px solid var(--er)', padding: 11, marginBottom: 13 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--er-t)', marginBottom: 3 }}>Threshold Exceeded</div>
        <div style={{ fontSize: 12, color: 'var(--ts)' }}>Sh-14 at $720 of $800 limit (90%). Request of $180 would bring total to $900 — $100 over limit.</div>
      </div>
      <label className="fl">Exception Reason (required)</label>
      <input className="fin" type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Critical operational requirement" />
      {!reason.trim() && <div className="fh" style={{ color: 'var(--er-t)', marginTop: 4 }}>Reason is required to submit</div>}
    </CvsModal>
  );
}

/* ── Exception Approve Modal (Brand Manager) ────────────────────────────── */
export function ExceptionApproveModal({ open, onClose }) {
  const { addToast } = useApp();
  const [notes, setNotes] = useState('');
  return (
    <CvsModal open={!!open} onClose={onClose} title="Approve Exception" subtitle="PC-0041 · Sh-14 over limit"
      footer={<>
        <button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={onClose}>Cancel</button>
        <button className="ab dan" style={{ height: 42, padding: '0 20px' }} onClick={() => { onClose(); addToast('er', 'Exception rejected', 'PC-0041 exception request has been rejected'); }}>Reject Exception</button>
        <button style={{ background: 'var(--pur)', borderColor: 'var(--pur)', color: '#fff', height: 42, padding: '0 20px', fontSize: 13, border: '1px solid', cursor: 'pointer', fontFamily: "'IBM Plex Sans',sans-serif" }}
          onClick={() => { onClose(); addToast('ok', 'Exception approved and paid', 'PC-0041 $180 disbursed via InnBucks'); setNotes(''); }}>
          Approve Exception &amp; Pay
        </button>
      </>}
    >
      <div style={{ background: 'var(--er-bg)', borderLeft: '3px solid var(--er)', padding: 11, marginBottom: 13 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--er-t)', marginBottom: 3 }}>Threshold Override Required</div>
        <div style={{ fontSize: 12, color: 'var(--ts)' }}>Sh-14 at 90% of $800 limit. Approving $180 brings total to $900. Exception will be logged.</div>
      </div>
      <label className="fl">Approval Notes</label>
      <input className="fin" type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Reason for exception approval" />
      <div style={{ marginTop: 11, fontSize: 11, color: 'var(--ts)', fontFamily: "'IBM Plex Mono',monospace", padding: 9, background: 'var(--l2)', border: '1px solid var(--bs)' }}>
        This exception will appear in audit log, monthly reconciliation report, and executive dashboard.
      </div>
    </CvsModal>
  );
}

/* ── Submit Request Modal ───────────────────────────────────────────────── */
export function SubmitRequestModal({ open, onClose, formData }) {
  const { addToast } = useApp();
  const data = formData || { brand: 'Chicken Inn', shop: 'Sh-14', supplier: 'CleanPro Supplies', category: 'Cleaning Supplies', amount: '180.00' };
  return (
    <CvsModal open={!!open} onClose={onClose} title="Review & Submit Request"
      footer={<>
        <button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={onClose}>Back</button>
        <button className="ab pri" style={{ height: 42, padding: '0 20px' }} onClick={() => { onClose(); addToast('ok', 'Request submitted', 'PC-0042 sent to Brand Accountant for review'); }}>
          Submit Request
        </button>
      </>}
    >
      {[
        { label: 'Brand / Shop', value: <><BrandChip brand={data.brand} /> {data.shop}</> },
        { label: 'Supplier', value: data.supplier },
        { label: 'Category', value: data.category },
        { label: 'Amount', value: <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--int)', fontFamily: "'IBM Plex Sans Condensed',sans-serif" }}>${data.amount}</span> },
      ].map((row, i, arr) => (
        <div key={i} className="cvs-detail-row" style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--bs)' : 'none' }}>
          <span className="cvs-detail-label">{row.label}</span><span>{row.value}</span>
        </div>
      ))}
      <div style={{ marginTop: 11, padding: 10, background: 'var(--er-bg)', borderLeft: '3px solid var(--er)' }}>
        <div style={{ fontSize: 11, color: 'var(--er-t)', fontWeight: 600 }}>⚠ Threshold Notice</div>
        <div style={{ fontSize: 11, color: 'var(--ts)', marginTop: 2 }}>Sh-14 at 90% of monthly limit. This request will trigger exception review by Brand Accountant.</div>
      </div>
    </CvsModal>
  );
}

/* ── Budget Modal (Accountant) ──────────────────────────────────────────── */
export function BudgetModal({ open, onClose }) {
  const { addToast } = useApp();
  const [budgets, setBudgets] = useState([
    { id: 'Sh-03', loc: 'Avondale',  budget: 1200, caps: '' },
    { id: 'Sh-19', loc: 'Eastgate',  budget: 1000, caps: '' },
    { id: 'Sh-08', loc: 'Sam Levy',  budget: 900,  caps: '' },
    { id: 'Sh-22', loc: 'Borrowdale',budget: 1100, caps: '' },
    { id: 'Sh-11', loc: 'Highfield', budget: 800,  caps: '' },
  ]);
  const update = (id, field, val) => setBudgets(b => b.map(s => s.id === id ? { ...s, [field]: val } : s));
  return (
    <CvsModal open={!!open} onClose={onClose} size="lg" title="Set Shop Budgets — Pizza Inn" subtitle="Set monthly petty cash limits per shop"
      footer={<>
        <button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={onClose}>Cancel</button>
        <button className="ab pri" style={{ height: 42, padding: '0 20px' }} onClick={() => { onClose(); addToast('ok', 'Budgets updated', `Monthly budgets saved for ${budgets.length} Pizza Inn shops`); }}>
          Save Budgets
        </button>
      </>}
    >
      <table className="dt">
        <thead><tr><th>Shop</th><th>Location</th><th>Current Budget</th><th>New Monthly Budget (USD)</th><th>Category Caps</th></tr></thead>
        <tbody>
          {budgets.map(s => (
            <tr key={s.id}>
              <td><strong>{s.id}</strong></td>
              <td>{s.loc}</td>
              <td>${s.budget.toLocaleString()}</td>
              <td><input className="fin" type="number" value={s.budget} onChange={e => update(s.id, 'budget', +e.target.value)} style={{ width: 120 }} /></td>
              <td><input className="fin" type="text" value={s.caps} onChange={e => update(s.id, 'caps', e.target.value)} placeholder="e.g. Cleaning $300" style={{ width: 180 }} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 13, padding: 10, background: 'var(--info-bg)', borderLeft: '3px solid var(--int)' }}>
        <div style={{ fontSize: 11, color: 'var(--info)' }}>Threshold alerts trigger at 80%. Shops at 80–99% show MONITOR, at 90%+ trigger exception workflow. All budget changes are logged.</div>
      </div>
    </CvsModal>
  );
}

/* ── Invite User Modal (Admin) ──────────────────────────────────────────── */
export function InviteUserModal({ open, onClose }) {
  const { addToast } = useApp();
  const [form, setForm] = useState({ name: '', email: '', role: 'Shop Manager', brand: 'All Brands', shop: 'N/A', budget: '', note: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.name.trim() && form.email.includes('@');
  return (
    <CvsModal open={!!open} onClose={onClose} title="Invite New User" subtitle="Send email invitation with role and brand access"
      footer={<>
        <button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={onClose}>Cancel</button>
        <button className="ab pri" style={{ height: 42, padding: '0 20px' }} disabled={!valid}
          onClick={() => { onClose(); addToast('ok', 'Invitation sent', `Email dispatched to ${form.email} with ${form.role} access`); setForm({ name: '', email: '', role: 'Shop Manager', brand: 'All Brands', shop: 'N/A', budget: '', note: '' }); }}>
          Send Invitation
        </button>
      </>}
    >
      <div className="fg">
        <div className="fi"><label className="fl">Full Name</label><input className="fin" value={form.name} onChange={e => set('name', e.target.value)} placeholder="First Last" /></div>
        <div className="fi"><label className="fl">Email Address</label><input className="fin" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="name@simbisa.co.zw" /></div>
        <div className="fi">
          <label className="fl">Role</label>
          <select className="fsel" value={form.role} onChange={e => set('role', e.target.value)}>
            {['Shop Manager','Brand Accountant','Brand Manager','Procurement','Executive','Admin'].map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="fi">
          <label className="fl">Brand</label>
          <select className="fsel" value={form.brand} onChange={e => set('brand', e.target.value)}>
            <option>All Brands</option>
            {BRANDS.map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div className="fi">
          <label className="fl">Shop (if Manager)</label>
          <select className="fsel" value={form.shop} onChange={e => set('shop', e.target.value)}>
            {['N/A','Sh-14 Borrowdale','Sh-07 Avondale','Sh-22 Eastgate','Sh-03 Avondale','Sh-11 Highfield'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="fi">
          <label className="fl">Monthly Budget Limit</label>
          <input className="fin" type="number" value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="e.g. 800" />
          <div className="fh">For Shop Managers only</div>
        </div>
        <div className="fi full">
          <label className="fl">Note to User (in invite email)</label>
          <input className="fin" type="text" value={form.note} onChange={e => set('note', e.target.value)} placeholder="Welcome to CVS. Click the link to set your password." />
        </div>
      </div>
      {!valid && form.name && <div style={{ marginTop: 8, fontSize: 11, color: 'var(--er-t)', fontFamily: "'IBM Plex Mono',monospace" }}>Enter a valid email address to send the invitation.</div>}
    </CvsModal>
  );
}

/* ── Statement Modal ────────────────────────────────────────────────────── */
export function StatementModal({ open, onClose }) {
  const { addToast } = useApp();
  const [filters, setFilters] = useState({ brand: 'All Brands', shop: 'All Shops', from: '2025-03-01', to: '2025-03-23', status: 'All', currency: 'USD' });
  const setF = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  const allRows = [
    { inv: 'INV-2025-4412', date: '23 Mar 14:31', brand: 'Chicken Inn', shop: 'Sh-22', amt: '$142.00', ref: 'IB-TXN-93412', status: 'SETTLED', refColor: '#24a148', statusColor: '#0e6027' },
    { inv: 'INV-2025-4411', date: '23 Mar 14:28', brand: 'Pizza Inn',   shop: 'Sh-03', amt: '$89.50',  ref: 'IB-TXN-93411', status: 'SETTLED', refColor: '#24a148', statusColor: '#0e6027' },
    { inv: 'INV-2025-4408', date: '23 Mar 14:18', brand: 'Creamy Inn',  shop: 'Sh-11', amt: '$36.00',  ref: 'Pending',       status: 'PENDING', refColor: '#684e00', statusColor: '#684e00' },
    { inv: 'INV-2025-4404', date: '23 Mar 13:44', brand: 'Chicken Inn', shop: 'Sh-14', amt: '$210.00', ref: 'IB-TXN-93404', status: 'SETTLED', refColor: '#24a148', statusColor: '#0e6027' },
    { inv: 'INV-2025-4401', date: '23 Mar 12:10', brand: 'Pizza Inn',   shop: 'Sh-19', amt: '$54.00',  ref: 'IB-TXN-93401', status: 'SETTLED', refColor: '#24a148', statusColor: '#0e6027' },
  ];
  const rows = allRows.filter(r => {
    if (filters.brand !== 'All Brands' && r.brand !== filters.brand) return false;
    if (filters.shop !== 'All Shops' && r.shop !== filters.shop) return false;
    if (filters.status !== 'All' && r.status !== filters.status.toUpperCase()) return false;
    return true;
  });
  const total = rows.reduce((s, r) => s + parseFloat(r.amt.replace('$', '')), 0);

  return (
    <CvsModal open={!!open} onClose={onClose} size="lg" title="InnBucks Sales Statement" subtitle="Generate PDF statement with filters"
      footer={<>
        <button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={onClose}>Cancel</button>
        <button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={() => { const w = window.open('', '_blank'); w.document.write(document.getElementById('stmt-preview').outerHTML); w.print(); }}>Print Preview</button>
        <button className="ab pri" style={{ height: 42, padding: '0 20px' }} onClick={() => { onClose(); addToast('ok', 'Statement generated', `InnBucks PDF statement downloaded — ${rows.length} transactions, $${total.toFixed(2)}`); }}>
          Download PDF
        </button>
      </>}
    >
      <div className="fg" style={{ marginBottom: 16 }}>
        <div className="fi"><label className="fl">Brand</label>
          <select className="fsel" value={filters.brand} onChange={e => setF('brand', e.target.value)}>
            <option>All Brands</option><option>Chicken Inn</option><option>Pizza Inn</option><option>Creamy Inn</option>
          </select>
        </div>
        <div className="fi"><label className="fl">Shop</label>
          <select className="fsel" value={filters.shop} onChange={e => setF('shop', e.target.value)}>
            <option>All Shops</option><option>Sh-14</option><option>Sh-22</option><option>Sh-03</option><option>Sh-19</option><option>Sh-11</option>
          </select>
        </div>
        <div className="fi"><label className="fl">From</label><input className="fin" type="date" value={filters.from} onChange={e => setF('from', e.target.value)} /></div>
        <div className="fi"><label className="fl">To</label><input className="fin" type="date" value={filters.to} onChange={e => setF('to', e.target.value)} /></div>
        <div className="fi"><label className="fl">Status</label>
          <select className="fsel" value={filters.status} onChange={e => setF('status', e.target.value)}>
            <option>All</option><option>Settled</option><option>Pending</option>
          </select>
        </div>
        <div className="fi"><label className="fl">Currency</label><select className="fsel"><option>USD</option></select></div>
      </div>
      <div id="stmt-preview" style={{ border: '1px solid var(--bs)', background: '#fff', padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingBottom: 14, borderBottom: '3px solid #161616' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 30, height: 30, background: 'var(--int)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11, color: '#fff', fontFamily: "'IBM Plex Mono',monospace" }}>CVS</div>
            <div>
              <div style={{ fontFamily: "'IBM Plex Sans Condensed',sans-serif", fontWeight: 700, fontSize: 15 }}>SIMBISA BRANDS</div>
              <div style={{ fontSize: 10, color: '#525252', fontFamily: "'IBM Plex Mono',monospace" }}>Cash Verification System</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'IBM Plex Sans Condensed',sans-serif", fontSize: 20, fontWeight: 700 }}>INNBUCKS STATEMENT</div>
            <div style={{ fontSize: 10, color: '#525252', fontFamily: "'IBM Plex Mono',monospace", marginTop: 3 }}>
              {filters.brand} · {filters.shop} · {filters.from} — {filters.to}
            </div>
          </div>
        </div>
        {rows.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--ts)', fontSize: 13 }}>No transactions match the current filters.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f4f4f4' }}>
                {['Invoice No.','Date','Brand','Shop','Ccy','Amount','InnBucks Ref','Status'].map(h => (
                  <th key={h} style={{ padding: '7px 9px', textAlign: h === 'Amount' ? 'right' : 'left', fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, fontWeight: 600, color: '#525252', textTransform: 'uppercase', borderBottom: '1px solid #e0e0e0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} style={{ background: i % 2 ? '#f9f9f9' : '#fff', borderBottom: '1px solid #f4f4f4' }}>
                  <td style={{ padding: '6px 9px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: '#0043ce' }}>{r.inv}</td>
                  <td style={{ padding: '6px 9px', color: '#525252' }}>{r.date}</td>
                  <td style={{ padding: '6px 9px' }}>{r.brand}</td>
                  <td style={{ padding: '6px 9px' }}>{r.shop}</td>
                  <td style={{ padding: '6px 9px', fontFamily: "'IBM Plex Mono',monospace" }}>USD</td>
                  <td style={{ padding: '6px 9px', textAlign: 'right', fontWeight: 600 }}>{r.amt}</td>
                  <td style={{ padding: '6px 9px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: r.refColor }}>{r.ref}</td>
                  <td style={{ padding: '6px 9px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, fontWeight: 700, color: r.statusColor }}>{r.status}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: '#161616' }}>
                <td colSpan={5} style={{ padding: 9, fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, fontWeight: 700, color: '#f4f4f4', textTransform: 'uppercase', letterSpacing: '.05em' }}>TOTAL USD — {rows.length} transaction{rows.length !== 1 ? 's' : ''}</td>
                <td style={{ padding: 9, textAlign: 'right', fontFamily: "'IBM Plex Sans Condensed',sans-serif", fontSize: 16, fontWeight: 700, color: '#78a9ff' }}>${total.toFixed(2)}</td>
                <td colSpan={2} style={{ padding: 9, fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: '#78a9ff' }}>
                  {rows.filter(r => r.status === 'SETTLED').length} settled · {rows.filter(r => r.status === 'PENDING').length} pending
                </td>
              </tr>
            </tfoot>
          </table>
        )}
        <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#8d8d8d', fontFamily: "'IBM Plex Mono',monospace" }}>
          <span>Simbisa Brands Ltd · CVS InnBucks Statement · CONFIDENTIAL</span>
          <span>Cash Verification System · Powered by InnBucks API</span>
        </div>
      </div>
    </CvsModal>
  );
}
