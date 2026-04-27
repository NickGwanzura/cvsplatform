import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import StatusTag from '../components/shared/StatusTag';
import LineChart from '../components/shared/LineChart';
import Breadcrumbs from '../components/shared/Breadcrumbs';
import EndpointPendingBanner from '../components/shared/EndpointPendingBanner';
import { ValidateModal, BudgetModal, RejectModal, RequestDetailModal, ProcurementRequestDetailModal } from '../components/modals/AllModals';
import { formatMoney, formatMoneyShort, convert } from '../lib/currency';
import {
  listShops,
  listProcurementRequests,
  approveProcurementRequest,
  rejectProcurementRequest,
  listBudgets,
} from '../lib/cvsApi';

// Map a /procurement/requests record into the review-queue row shape.
const toQueueRow = (r) => {
  const amt = Number(r.amount || 0);
  return {
    id: r.id,
    mgr: r.requested_by?.full_name || r.requested_by?.name || '—',
    shop: r.shop?.name || '—',
    cat: r.category?.name || '—',
    supplier: r.supplier?.name || '—',
    amt: `$${amt.toFixed(2)}`,
    rawAmt: amt,
    budget: 'within',
  };
};

// Budget burn trend across 4 weeks — per shop (multi-line)
const BUDGET_TREND = [];

const pctColor = (p) => p >= 90 ? 'var(--er)' : p >= 70 ? 'var(--wa-t)' : 'var(--ok-t)';

export default function AccDashboard() {
  const { addToast, activeTab, currency, session } = useApp();
  const [tab, setTab] = useState(activeTab ?? 0);
  useEffect(() => { setTab(activeTab ?? 0); }, [activeTab]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [checkedAll, setCheckedAll] = useState(false);
  const [checked, setChecked] = useState({});
  const [showBudget, setShowBudget] = useState(false);
  const [validateTarget, setValidateTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [viewShop, setViewShop] = useState(null);
  const [viewRequestId, setViewRequestId] = useState(null);
  const [shopsRaw, setShopsRaw] = useState([]);
  const [QUEUE_DATA, setQueueData] = useState([]);
  const [queueLoading, setQueueLoading] = useState(true);
  const [queueError, setQueueError] = useState('');
  const [budgetsRaw, setBudgetsRaw] = useState([]);
  const [budgetsError, setBudgetsError] = useState('');

  const refreshQueue = useCallback(() => {
    setQueueLoading(true);
    listProcurementRequests({ status: 'pending' })
      .then((list) => setQueueData(Array.isArray(list) ? list.map(toQueueRow) : []))
      .catch((err) => setQueueError(err?.response?.data?.message || err.message || 'Failed to load queue'))
      .finally(() => setQueueLoading(false));
  }, []);

  useEffect(() => {
    let cancelled = false;
    listShops()
      .then((list) => !cancelled && setShopsRaw(Array.isArray(list) ? list : []))
      .catch(() => !cancelled && setShopsRaw([]));
    refreshQueue();
    listBudgets()
      .then((list) => !cancelled && setBudgetsRaw(Array.isArray(list) ? list : []))
      .catch((err) => !cancelled && setBudgetsError(err?.response?.data?.message || err.message || ''));
    return () => { cancelled = true; };
  }, [refreshQueue]);

  // Index per-shop budget by shop_id so the table can join with /shops.
  const budgetByShop = budgetsRaw.reduce((acc, b) => {
    if (b.shop_id) acc[b.shop_id] = b;
    return acc;
  }, {});

  const handleApprove = async (row) => {
    try {
      await approveProcurementRequest(row.id);
      addToast('ok', `${row.id} approved`, 'Forwarded to Brand Manager');
      refreshQueue();
    } catch (err) {
      addToast('er', 'Approve failed', err?.response?.data?.message || err.message || 'Try again');
    }
  };

  const confirmReject = async (reason) => {
    if (!rejectTarget) return;
    try {
      await rejectProcurementRequest(rejectTarget.id, reason);
      addToast('er', `${rejectTarget.id} rejected`, 'Shop manager will be notified');
      refreshQueue();
    } catch (err) {
      addToast('er', 'Reject failed', err?.response?.data?.message || err.message || 'Try again');
    }
  };

  // Map API shops into the shape the existing UI consumes. Budget rows come
  // from /budgets indexed by shop_id; disbursed totals still aren't exposed
  // by the backend so default to 0 until /reports/shop ships.
  const SHOPS = shopsRaw
    .filter((s) => !session?.brand || s.brand?.name === session.brand)
    .map((s) => {
      const b = budgetByShop[s.id];
      const budget = Number(b?.amount ?? b?.monthly_amount ?? 0);
      return {
        id: s.id,
        shop: s.name,
        brand: s.brand?.name || session?.brand || '—',
        loc: s.location || '—',
        budget,
        spent: 0,
        pct: 0,
        manager: '—',
        status: budget > 0 ? 'ok' : 'pending',
      };
    });

  const filteredQueue = QUEUE_DATA.filter(q => {
    const matchSearch = !search || [q.id, q.mgr, q.shop, q.cat, q.supplier].some(v => v.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'All' || (statusFilter === 'Over Limit' ? q.budget === 'over' : q.budget === 'within');
    return matchSearch && matchStatus;
  });

  const toggleAll = (c) => {
    setCheckedAll(c);
    const next = {};
    filteredQueue.forEach(q => { next[q.id] = c; });
    setChecked(next);
  };

  const selectedCount = Object.values(checked).filter(Boolean).length;

  const tabs = ['Overview', `Review Queue (${QUEUE_DATA.length})`, 'Budget Management'];

  return (
    <>
      <div className="ph">
        <Breadcrumbs items={[
          { label: 'CVS' },
          { label: session?.brand || '—' },
          { label: 'Brand Accountant' },
          { label: 'Dashboard' },
        ]} />
        <div className="ptabs">
          {tabs.map((t, i) => (
            <button key={t} className={`ptab${tab === i ? ' on' : ''}`} onClick={() => setTab(i)}>{t}</button>
          ))}
        </div>
      </div>
      <div className="cnt">

        {/* ── Tab 0: Overview ──────────────────────────────────────────── */}
        {tab === 0 && (<>
          <EndpointPendingBanner
            feature="Brand budget overview and per-shop summaries"
            endpoints={['GET /api/v1/cash-entries?brand_id=:id', 'GET /api/v1/reports/brand', 'GET /api/v1/reports/shop']}
            note="cash_entries.view + reports.brand.view + reports.shop.view permissions are seeded on BRAND_ACCOUNTANT but the routes 404."
          />
          <div className="kg c4">
            <div className="kc bl"><div className="kl">Total Budget — {session?.brand || '—'}</div><div className="kv">—</div><div className="kd nt">Across — shops this month</div><div className="ki">💳</div></div>
            <div className="kc rd"><div className="kl">Total Disbursed</div><div className="kv">—</div><div className="kd dn">—% of total budget used</div><div className="ki">📊</div></div>
            <div className="kc gn"><div className="kl">Remaining Budget</div><div className="kv">—</div><div className="kd up">—% available</div><div className="ki">✓</div></div>
            <div className="kc yw"><div className="kl">Pending Requests</div><div className="kv">—</div><div className="kd nt">Awaiting your review</div><div className="ki">⏳</div></div>
          </div>

          {/* Budget burn trend chart */}
          <div style={{ background: 'var(--l1)', border: '1px solid var(--bs)', padding: '14px 18px', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>Monthly Budget Burn</div>
                <div style={{ fontSize: 11, color: 'var(--ts)', fontFamily: "'IBM Plex Mono',monospace", marginTop: 2 }}>Cumulative spend per week</div>
              </div>
            </div>
            <LineChart data={BUDGET_TREND} color="#0f62fe" height={140} multiline={true} />
          </div>

          <div className="tbbar">
            <div className="tbt">Budget vs Disbursed — {session?.brand || '—'} Shops</div>
            <button className="ab sec" style={{ height: 34, fontSize: 12 }} onClick={() => setShowBudget(true)}>Set Budgets</button>
          </div>
          <table className="dt">
            <thead><tr><th>Shop</th><th>Location</th><th>Monthly Budget</th><th>Disbursed</th><th>Remaining</th><th>% Used</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {SHOPS.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--ts)', padding: 20 }}>No data yet.</td></tr>
              ) : SHOPS.map(s => (
                <tr key={s.id}>
                  <td><strong>{s.id}</strong></td>
                  <td>{s.loc}</td>
                  <td>{formatMoneyShort(s.budget, currency)}</td>
                  <td>{formatMoneyShort(s.spent, currency)}</td>
                  <td>{formatMoneyShort(s.budget - s.spent, currency)}</td>
                  <td><span style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600, color: pctColor(s.pct) }}>{s.pct}%</span></td>
                  <td><StatusTag type={s.status} /></td>
                  <td><button className="rb vw" onClick={() => setViewShop(s)}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>)}

        {/* ── Tab 1: Review Queue ───────────────────────────────────────── */}
        {tab === 1 && (<>
          <EndpointPendingBanner
            feature="Per-request budget gating (over/within limit) and disbursed totals"
            endpoints={['GET /api/v1/reports/shop', 'GET /api/v1/reports/brand']}
            note="Approve & Reject are wired to /procurement/requests. The over/within-limit flag and disbursed totals still need /reports to ship."
          />
          <div className="kg c4">
            <div className="kc yw"><div className="kl">Pending Review</div><div className="kv">{QUEUE_DATA.length}</div><div className="kd nt">Awaiting validation</div><div className="ki">⏳</div></div>
            <div className="kc rd"><div className="kl">Over Budget Limit</div><div className="kv">{QUEUE_DATA.filter(q => q.budget === 'over').length}</div><div className="kd dn">Require exception approval</div><div className="ki">⚠</div></div>
            <div className="kc bl"><div className="kl">Total Queue Value</div><div className="kv">{formatMoneyShort(QUEUE_DATA.reduce((s,q) => s+q.rawAmt, 0), currency)}</div><div className="kd nt">Pending disbursement</div><div className="ki">💳</div></div>
            <div className="kc gn"><div className="kl">Within Limit</div><div className="kv">{QUEUE_DATA.filter(q => q.budget === 'within').length}</div><div className="kd up">Ready to validate</div><div className="ki">✓</div></div>
          </div>

          {selectedCount > 0 && (
            <div className="batch-bar show" style={{ marginBottom: 0 }}>
              <div className="batch-ct">{selectedCount} request{selectedCount !== 1 ? 's' : ''} selected</div>
              <button className="batch-act sec" onClick={() => { setChecked({}); setCheckedAll(false); }}>Clear</button>
              <button className="batch-act pri" onClick={() => { addToast('ok', `${selectedCount} requests validated`, 'Forwarded to Brand Manager for approval'); setChecked({}); setCheckedAll(false); }}>
                Validate Selected
              </button>
            </div>
          )}

          <div className="tbbar">
            <div className="tbt">Review Queue — {session?.brand || '—'}</div>
            <input className="srch" placeholder="Search ID, manager, shop…" value={search} onChange={e => setSearch(e.target.value)} />
            <select className="fsel" style={{ width: 130, height: 32, fontSize: 12 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option>All</option>
              <option>Over Limit</option>
              <option>Within Limit</option>
            </select>
          </div>
          <table className="dt">
            <thead>
              <tr>
                <th className="ck"><input type="checkbox" checked={checkedAll} onChange={e => toggleAll(e.target.checked)} /></th>
                <th>ID</th><th>Manager</th><th>Shop</th><th>Category</th><th>Supplier</th><th>Amount</th><th>Budget Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {queueLoading
                ? <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--ts)', padding: 20 }}>Loading…</td></tr>
                : queueError
                  ? <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--er-t)', padding: 20 }}>{queueError}</td></tr>
                  : filteredQueue.length === 0
                    ? <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--ts)', padding: 20 }}>No requests match filter</td></tr>
                    : filteredQueue.map(q => (
                      <tr key={q.id} style={q.rowBg ? { background: q.rowBg } : {}}>
                        <td className="ck"><input type="checkbox" checked={!!checked[q.id]} onChange={e => setChecked(c => ({ ...c, [q.id]: e.target.checked }))} /></td>
                        <td><code style={{ color: q.budget === 'over' ? 'var(--er)' : 'var(--info)', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11 }}>{q.id}</code></td>
                        <td>{q.mgr}</td><td style={{ fontSize: 12 }}>{q.shop}</td><td>{q.cat}</td><td>{q.supplier}</td>
                        <td><strong>{q.amt}</strong></td>
                        <td><StatusTag type={q.budget} /></td>
                        <td>
                          <div className="ra">
                            <button className="rb vw" onClick={() => setViewRequestId(q.id)} title="View detail">View</button>
                            <button className="rb ap" onClick={() => handleApprove(q)}>Approve</button>
                            {q.budget === 'over' && <button className="rb ed" onClick={() => setValidateTarget(q)}>Adjust</button>}
                            <button className="rb rj" onClick={() => setRejectTarget(q)}>Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))
              }
            </tbody>
          </table>
        </>)}

        {/* ── Tab 2: Budget Management ──────────────────────────────────── */}
        {tab === 2 && (<>
          {budgetsError ? (
            <div className="ntf wa" style={{ marginBottom: 12 }}>
              <div>
                <div className="ntf-t">Could not load budgets</div>
                <div className="ntf-b">{budgetsError}</div>
              </div>
            </div>
          ) : null}
          <EndpointPendingBanner
            feature="Disbursed totals and 80% threshold computation"
            endpoints={['GET /api/v1/reports/brand']}
            note="/budgets is wired (list/store/update/delete). Disbursed-vs-budget metrics still need /reports to ship."
          />
          <div className="ntf info" style={{ marginBottom: 16 }}>
            <div>
              <div className="ntf-t">Monthly Budget Configuration — {session?.brand || '—'}</div>
              <div className="ntf-b">Set per-shop limits and category caps. Threshold alerts trigger at 80% utilisation.</div>
            </div>
          </div>
          <div className="tbbar">
            <div className="tbt">Shop Budget Limits</div>
            <button className="ab pri" style={{ height: 34, fontSize: 12, gap: 6, display: 'flex', alignItems: 'center' }} onClick={() => setShowBudget(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
              Edit Budgets
            </button>
          </div>
          <table className="dt">
            <thead><tr><th>Shop</th><th>Location</th><th>Monthly Budget</th><th>Disbursed</th><th>Remaining</th><th>% Used</th><th>80% Threshold</th><th>Status</th></tr></thead>
            <tbody>
              {SHOPS.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--ts)', padding: 20 }}>No data yet.</td></tr>
              ) : SHOPS.map(s => (
                <tr key={s.id}>
                  <td><strong>{s.id}</strong></td>
                  <td>{s.loc}</td>
                  <td>{formatMoneyShort(s.budget, currency)}</td>
                  <td>{formatMoneyShort(s.spent, currency)}</td>
                  <td>{formatMoneyShort(s.budget - s.spent, currency)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 80, height: 6, background: 'var(--l3)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(s.pct, 100)}%`, background: pctColor(s.pct), transition: 'width 0.8s ease' }} />
                      </div>
                      <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, fontWeight: 600, color: pctColor(s.pct) }}>{s.pct}%</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--ts)' }}>{formatMoneyShort(Math.round(s.budget * 0.8), currency)}</td>
                  <td><StatusTag type={s.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>)}
      </div>

      <ValidateModal open={!!validateTarget} onClose={() => setValidateTarget(null)} request={validateTarget} />
      <BudgetModal
        open={showBudget}
        shops={shopsRaw.filter((s) => !session?.brand || s.brand?.name === session.brand)}
        budgets={budgetsRaw}
        onClose={(saved) => {
          setShowBudget(false);
          if (saved) {
            // Refresh budgets so the table reflects the new amounts.
            listBudgets()
              .then((list) => setBudgetsRaw(Array.isArray(list) ? list : []))
              .catch(() => {});
          }
        }}
      />
      <RejectModal
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        requestId={rejectTarget?.id}
        onConfirm={(reason) => confirmReject(reason)}
      />
      <ProcurementRequestDetailModal requestId={viewRequestId} onClose={() => setViewRequestId(null)} />
      <RequestDetailModal
        request={viewShop ? { id: viewShop.id, date: 'Mar 2025', cat: 'Budget View', purpose: `${viewShop.loc} — ${viewShop.pct}% of ${formatMoneyShort(viewShop.budget, currency)} budget`, supplier: 'N/A', amt: `${formatMoneyShort(viewShop.spent, currency)} disbursed`, status: viewShop.status } : null}
        onClose={() => setViewShop(null)}
      />
    </>
  );
}
