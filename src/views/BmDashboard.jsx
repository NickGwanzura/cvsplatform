import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import StatusTag from '../components/shared/StatusTag';
import LineChart from '../components/shared/LineChart';
import Breadcrumbs from '../components/shared/Breadcrumbs';
import { PayModal, BatchPayModal, ExceptionApproveModal, StatementModal, RejectModal } from '../components/modals/AllModals';

const APPROVALS = [];

const INNBUCKS = [];

const RECON = [];

const DAILY_SALES = [];

const reconColor = (s) => s === 'matched' ? 'var(--ok-t)' : s === 'discrepancy' ? 'var(--er)' : 'var(--wa-t)';
const reconBg    = (s) => s === 'matched' ? 'var(--ok-bg)' : s === 'discrepancy' ? '#fff1f1' : 'var(--wa-bg)';
const reconLabel = (s) => s === 'matched' ? 'MATCHED' : s === 'discrepancy' ? 'DISCREPANCY' : 'PENDING';

export default function BmDashboard() {
  const { addToast, activeTab, session } = useApp();
  const [tab, setTab] = useState(activeTab ?? 0);
  useEffect(() => { setTab(activeTab ?? 0); }, [activeTab]);
  const [selected, setSelected] = useState({});
  const [payTarget, setPayTarget] = useState(null);
  const [showBatch, setShowBatch] = useState(false);
  const [showExcApprove, setShowExcApprove] = useState(false);
  const [showStatement, setShowStatement] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [raisedRecon, setRaisedRecon] = useState({});

  const selectedIds = Object.keys(selected).filter(id => selected[id]);
  const selectedRows = APPROVALS.filter(a => selectedIds.includes(a.id));
  const selectedCount = selectedIds.length;

  const totalSales = INNBUCKS.filter(r => r.status === 'settled').reduce((s, r) => s + r.rawAmt, 0);
  const discrepancies = RECON.filter(r => r.status === 'discrepancy').length;

  const toggleAll = (c) => {
    const next = {};
    APPROVALS.forEach(a => { next[a.id] = c; });
    setSelected(next);
  };

  const tabs = ['Approvals', 'InnBucks Sales'];

  return (
    <>
      <div className="ph">
        <Breadcrumbs items={[
          { label: 'CVS' },
          { label: session?.brand || '—' },
          { label: 'Brand Manager' },
          { label: 'Approvals' },
        ]} />
        <div className="ptabs">
          {tabs.map((t, i) => (
            <button key={t} className={`ptab${tab === i ? ' on' : ''}`} onClick={() => setTab(i)}>{t}</button>
          ))}
        </div>
      </div>
      <div className="cnt">

        {/* ── Tab 0: Approvals ─────────────────────────────────────────── */}
        {tab === 0 && (<>
          <div className="kg c4">
            <div className="kc yw"><div className="kl">Pending Approvals</div><div className="kv">{APPROVALS.length}</div><div className="kd nt">Validated by Accountant</div><div className="ki">⏳</div></div>
            <div className="kc bl"><div className="kl">Total to Disburse</div><div className="kv">${APPROVALS.reduce((s,a) => s+a.rawAmt, 0).toLocaleString()}</div><div className="kd nt">If all approved</div><div className="ki">💳</div></div>
            <div className="kc gn"><div className="kl">Paid This Week</div><div className="kv">—</div><div className="kd nt">—</div><div className="ki">✓</div></div>
            <div className="kc rd"><div className="kl">Exception Requests</div><div className="kv">—</div><div className="kd nt">—</div><div className="ki">🚨</div></div>
          </div>

          <div className={`batch-bar${selectedCount > 0 ? ' show' : ''}`}>
            <div className="batch-ct">{selectedCount} request{selectedCount !== 1 ? 's' : ''} selected — ${selectedRows.reduce((s,r) => s+r.rawAmt, 0).toFixed(2)} total</div>
            <button className="batch-act sec" onClick={() => setSelected({})}>Clear Selection</button>
            <button className="batch-act pri" onClick={() => setShowBatch(true)}>Batch Pay via InnBucks</button>
          </div>


          <div className="tbbar">
            <div className="tbt">Pending Approvals — {session?.brand || '—'}</div>
            <button className="ab sec" style={{ height: 34, fontSize: 12 }} onClick={() => selectedCount > 0 ? setShowBatch(true) : addToast('wa', 'No requests selected', 'Check at least one request to batch pay')}>Batch Pay Selected</button>
          </div>
          <table className="dt">
            <thead>
              <tr>
                <th className="ck"><input type="checkbox" onChange={e => toggleAll(e.target.checked)} checked={selectedCount === APPROVALS.length} /></th>
                <th>ID</th><th>Manager</th><th>Shop</th><th>Purpose</th><th>Supplier</th><th>InnBucks Wallet</th><th>Amount</th><th>Flag</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {APPROVALS.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', color: 'var(--ts)', padding: 20 }}>No data yet.</td></tr>
              ) : APPROVALS.map(a => (
                <tr key={a.id}>
                  <td className="ck"><input type="checkbox" checked={!!selected[a.id]} onChange={e => setSelected(s => ({ ...s, [a.id]: e.target.checked }))} /></td>
                  <td><code style={{ color: a.idColor, fontFamily: "'IBM Plex Mono',monospace", fontSize: 11 }}>{a.id}</code></td>
                  <td>{a.mgr}</td><td>{a.shop}</td><td>{a.purpose}</td><td>{a.supplier}</td>
                  <td><code style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11 }}>{a.wallet}</code></td>
                  <td><strong style={{ color: 'var(--int)' }}>{a.amt}</strong></td>
                  <td><StatusTag type={a.flag} /></td>
                  <td>
                    <div className="ra">
                      <button className="rb pay" onClick={() => setPayTarget(a)}>Pay InnBucks</button>
                      <button className="rb rj" onClick={() => setRejectTarget(a)}>Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>)}

        {/* ── Tab 1: InnBucks Sales ─────────────────────────────────────── */}
        {tab === 1 && (<>
          <div className="kg c4">
            <div className="kc gn"><div className="kl">Today's Sales</div><div className="kv">${totalSales.toFixed(2)}</div><div className="kd up">↑ {INNBUCKS.filter(r => r.status === 'settled').length} transactions settled</div><div className="ki">📈</div></div>
            <div className="kc bl"><div className="kl">Settled</div><div className="kv">{INNBUCKS.filter(r => r.status === 'settled').length}</div><div className="kd up">Fully processed</div><div className="ki">✓</div></div>
            <div className="kc yw"><div className="kl">Pending</div><div className="kv">{INNBUCKS.filter(r => r.status === 'pending').length}</div><div className="kd nt">Awaiting settlement</div><div className="ki">⏳</div></div>
            <div className={`kc ${discrepancies > 0 ? 'rd' : 'pr'}`}><div className="kl">Recon Discrepancies</div><div className="kv">{discrepancies}</div><div className="kd dn">{discrepancies > 0 ? 'Requires action' : 'All matched'}</div><div className="ki">{discrepancies > 0 ? '⚠' : '✓'}</div></div>
          </div>

          {/* 7-day trend chart */}
          <div style={{ background: 'var(--l1)', border: '1px solid var(--bs)', padding: '14px 18px', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>7-Day InnBucks Sales Trend — {session?.brand || '—'}</div>
                <div style={{ fontSize: 11, color: 'var(--ts)', fontFamily: "'IBM Plex Mono',monospace", marginTop: 2 }}>7-day trend</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--ok-t)', fontFamily: "'IBM Plex Mono',monospace" }}>—</div>
                <div style={{ fontSize: 10, color: 'var(--ts)' }}>Week total</div>
              </div>
            </div>
            <LineChart data={DAILY_SALES} color="#0f62fe" height={140} />
          </div>

          <div className="tbbar">
            <div className="tbt">Live Transactions — {session?.brand || '—'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ok)', animation: 'blink 1.5s infinite' }} />
              <span style={{ fontSize: 11, color: 'var(--ok-t)', fontFamily: "'IBM Plex Mono',monospace" }}>LIVE</span>
            </div>
            <button className="ab sec" style={{ height: 34, fontSize: 12 }} onClick={() => setShowStatement(true)}>Statement PDF</button>
            <button className="ab sec" style={{ height: 34, fontSize: 12 }} onClick={() => addToast('ok', 'Recon Report', 'Reconciliation PDF downloading…')}>Recon Report PDF</button>
          </div>
          <table className="dt">
            <thead><tr><th>Invoice No.</th><th>Time</th><th>Shop</th><th>Customer InnBucks No.</th><th>Currency</th><th>Amount</th><th>InnBucks Ref</th><th>Status</th></tr></thead>
            <tbody>
              {INNBUCKS.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--ts)', padding: 20 }}>No data yet.</td></tr>
              ) : INNBUCKS.map(r => (
                <tr key={r.inv}>
                  <td><code style={{ color: 'var(--info)', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11 }}>{r.inv}</code></td>
                  <td style={{ fontSize: 12, color: 'var(--ts)', fontFamily: "'IBM Plex Mono',monospace" }}>{r.time}</td>
                  <td>{r.shop}</td>
                  <td><code style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11 }}>{r.wallet}</code></td>
                  <td><code style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11 }}>{r.ccy}</code></td>
                  <td><strong>{r.amt}</strong></td>
                  <td><code style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: r.status === 'settled' ? 'var(--ok-t)' : 'var(--wa-t)' }}>{r.ref}</code></td>
                  <td><StatusTag type={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Reconciliation section */}
          <div style={{ marginTop: 24 }}>
            <div className="tbbar">
              <div className="tbt">Reconciliation — Invoice vs InnBucks Settlement</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono',monospace", color: 'var(--ok-t)' }}>
                  {RECON.filter(r => r.status === 'matched').length} matched
                </span>
                {discrepancies > 0 && (
                  <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono',monospace", color: 'var(--er)', fontWeight: 600 }}>
                    · {discrepancies} discrepancy
                  </span>
                )}
              </div>
            </div>
            <table className="dt">
              <thead><tr><th>InnBucks Ref</th><th>Invoice No.</th><th>Shop</th><th>Expected</th><th>Settled</th><th>Difference</th><th>Recon Status</th><th>Action</th></tr></thead>
              <tbody>
                {RECON.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--ts)', padding: 20 }}>No data yet.</td></tr>
                ) : RECON.map((r, i) => (
                  <tr key={i} style={r.status === 'discrepancy' ? { background: '#fff8f8' } : {}}>
                    <td><code style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: r.status === 'discrepancy' ? 'var(--er)' : 'var(--info)' }}>{r.ref}</code></td>
                    <td><code style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11 }}>{r.inv}</code></td>
                    <td style={{ fontSize: 12 }}>{r.shop}</td>
                    <td><strong>${r.expected.toFixed(2)}</strong></td>
                    <td style={{ color: r.settled === null ? 'var(--ts)' : 'inherit' }}>
                      {r.settled === null ? '—' : <strong>${r.settled.toFixed(2)}</strong>}
                    </td>
                    <td>
                      {r.status === 'matched' && <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--ok-t)' }}>$0.00</span>}
                      {r.status === 'discrepancy' && <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, fontWeight: 700, color: 'var(--er)' }}>${r.diff.toFixed(2)}</span>}
                      {r.status === 'pending' && <span style={{ fontSize: 11, color: 'var(--ts)' }}>—</span>}
                    </td>
                    <td>
                      <span style={{ fontSize: 10, fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600, padding: '2px 7px', background: reconBg(r.status), color: reconColor(r.status) }}>
                        {reconLabel(r.status)}
                      </span>
                    </td>
                    <td>
                      {r.status === 'discrepancy' && !raisedRecon[r.ref] && (
                        <button className="rb ed" style={{ fontSize: 10 }} onClick={() => {
                          setRaisedRecon(prev => ({ ...prev, [r.ref]: true }));
                          addToast('wa', 'Discrepancy raised', `${r.ref} — $${Math.abs(r.diff).toFixed(2)} variance reported to InnBucks`);
                        }}>Raise Dispute</button>
                      )}
                      {r.status === 'discrepancy' && raisedRecon[r.ref] && (
                        <span style={{ fontSize: 10, color: 'var(--ts)', fontFamily: "'IBM Plex Mono',monospace" }}>Raised</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>)}

      </div>

      <PayModal
        open={!!payTarget}
        onClose={() => setPayTarget(null)}
        request={payTarget ? { mgr: payTarget.mgr, id: payTarget.id, wallet: payTarget.wallet, amt: payTarget.amt, supplier: payTarget.supplier, shop: payTarget.shop } : null}
      />
      <BatchPayModal open={showBatch} onClose={() => setShowBatch(false)} rows={selectedRows.length > 0 ? selectedRows : undefined} />
      <ExceptionApproveModal open={showExcApprove} onClose={() => setShowExcApprove(false)} />
      <StatementModal open={showStatement} onClose={() => setShowStatement(false)} />
      <RejectModal
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        requestId={rejectTarget?.id}
        onConfirm={() => addToast('er', `${rejectTarget?.id} rejected`, 'Shop manager will be notified by email')}
      />
    </>
  );
}
