import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import StatusTag from '../components/shared/StatusTag';
import BrandChip from '../components/shared/BrandChip';
import AuditLog from '../components/shared/AuditLog';
import LineChart from '../components/shared/LineChart';
import { ValidateModal, BudgetModal, RejectModal, RequestDetailModal } from '../components/modals/AllModals';

const SHOPS = [
  { id: 'Sh-03', loc: 'Avondale',  budget: 1200, spent: 890,  pct: 74, status: 'monitor' },
  { id: 'Sh-19', loc: 'Eastgate',  budget: 1000, spent: 450,  pct: 45, status: 'ok' },
  { id: 'Sh-08', loc: 'Sam Levy',  budget: 900,  spent: 860,  pct: 96, status: 'alert' },
  { id: 'Sh-22', loc: 'Borrowdale',budget: 1100, spent: 620,  pct: 56, status: 'ok' },
  { id: 'Sh-11', loc: 'Highfield', budget: 800,  spent: 780,  pct: 97, status: 'alert' },
];

// Budget burn trend across 4 weeks — per shop (multi-line)
const BUDGET_TREND = [
  { label: 'Wk 1', lines: [{ name: 'Sh-03', value: 180, color: '#0f62fe' }, { name: 'Sh-08', value: 210, color: '#da1e28' }, { name: 'Sh-11', value: 160, color: '#6929c4' }, { name: 'Sh-19', value: 90,  color: '#24a148' }, { name: 'Sh-22', value: 140, color: '#f1c21b' }] },
  { label: 'Wk 2', lines: [{ name: 'Sh-03', value: 410, color: '#0f62fe' }, { name: 'Sh-08', value: 480, color: '#da1e28' }, { name: 'Sh-11', value: 390, color: '#6929c4' }, { name: 'Sh-19', value: 210, color: '#24a148' }, { name: 'Sh-22', value: 280, color: '#f1c21b' }] },
  { label: 'Wk 3', lines: [{ name: 'Sh-03', value: 650, color: '#0f62fe' }, { name: 'Sh-08', value: 680, color: '#da1e28' }, { name: 'Sh-11', value: 590, color: '#6929c4' }, { name: 'Sh-19', value: 340, color: '#24a148' }, { name: 'Sh-22', value: 430, color: '#f1c21b' }] },
  { label: 'Wk 4', lines: [{ name: 'Sh-03', value: 890, color: '#0f62fe' }, { name: 'Sh-08', value: 860, color: '#da1e28' }, { name: 'Sh-11', value: 780, color: '#6929c4' }, { name: 'Sh-19', value: 450, color: '#24a148' }, { name: 'Sh-22', value: 620, color: '#f1c21b' }] },
];

const QUEUE_DATA = [
  { id: 'PC-0044', mgr: 'T. Ndlovu',   shop: 'Sh-03 Avondale',   cat: 'Maintenance', supplier: 'OvenPro',     amt: '$450', rawAmt: 450, budget: 'over',   rowBg: '#fff8f8' },
  { id: 'PC-0043', mgr: 'R. Mhondoro', shop: 'Sh-19 Eastgate',   cat: 'Cleaning',    supplier: 'CleanPro',    amt: '$95',  rawAmt: 95,  budget: 'within', rowBg: null },
  { id: 'PC-0042', mgr: 'S. Gumbo',    shop: 'Sh-22 Borrowdale', cat: 'Stationery',  supplier: 'OfficeFirst', amt: '$45',  rawAmt: 45,  budget: 'within', rowBg: null },
  { id: 'PC-0040', mgr: 'K. Mutasa',   shop: 'Sh-14 Borrowdale', cat: 'Gas',         supplier: 'ZimGas',      amt: '$120', rawAmt: 120, budget: 'within', rowBg: null },
  { id: 'PC-0037', mgr: 'P. Moyo',     shop: 'Sh-08 Sam Levy',   cat: 'Emergency',   supplier: 'AquaFix',     amt: '$280', rawAmt: 280, budget: 'over',   rowBg: '#fff8f8' },
  { id: 'PC-0036', mgr: 'B. Chikwete', shop: 'Sh-11 Highfield',  cat: 'Maintenance', supplier: 'FastFix',     amt: '$190', rawAmt: 190, budget: 'within', rowBg: null },
  { id: 'PC-0033', mgr: 'R. Mhondoro', shop: 'Sh-19 Eastgate',   cat: 'Cleaning',    supplier: 'CleanPro',    amt: '$80',  rawAmt: 80,  budget: 'within', rowBg: null },
];

const LOGS = [
  { color: 'var(--er)', time: '23 Mar 13:10', text: '<strong>THRESHOLD ALERT</strong> — Sh-08 Sam Levy at 96% of $900 monthly budget', user: 'System Auto · Pizza Inn', chip: <BrandChip brand="Pizza Inn" /> },
  { color: 'var(--int)', time: '23 Mar 11:42', text: '<strong>VALIDATED</strong> — PC-0044 · $450 · Adjusted from $450 to $400 · Forwarded to Brand Manager', user: 'C. Mutandwa (Brand Accountant) · Pizza Inn Sh-03', chip: <BrandChip brand="Pizza Inn" /> },
  { color: 'var(--ok)', time: '22 Mar 09:05', text: '<strong>BUDGET SET</strong> — Sh-08 Sam Levy monthly budget set to $900', user: 'C. Mutandwa (Brand Accountant) · Pizza Inn', chip: <BrandChip brand="Pizza Inn" /> },
  { color: 'var(--wa)', time: '22 Mar 08:30', text: '<strong>REQUEST SUBMITTED</strong> — PC-0043 · $95 · Cleaning Supplies', user: 'R. Mhondoro (Shop Manager) · Pizza Inn Sh-19', chip: <BrandChip brand="Pizza Inn" /> },
];

const pctColor = (p) => p >= 90 ? 'var(--er)' : p >= 70 ? 'var(--wa-t)' : 'var(--ok-t)';

export default function AccDashboard() {
  const { addToast, activeTab } = useApp();
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
        <div className="bc">CVS <span>/</span> Pizza Inn <span>/</span> Brand Accountant <span>/</span> Dashboard</div>
        <div className="pt">Brand Accountant Dashboard — Pizza Inn</div>
        <div className="pd">All shops under Pizza Inn brand · Tuesday 23 March 2025</div>
        <div className="ptabs">
          {tabs.map((t, i) => (
            <button key={t} className={`ptab${tab === i ? ' on' : ''}`} onClick={() => setTab(i)}>{t}</button>
          ))}
        </div>
      </div>
      <div className="cnt">

        {/* ── Tab 0: Overview ──────────────────────────────────────────── */}
        {tab === 0 && (<>
          <div className="kg c4">
            <div className="kc bl"><div className="kl">Total Budget — Pizza Inn</div><div className="kv">$12,400</div><div className="kd nt">Across 12 shops this month</div><div className="ki">💳</div></div>
            <div className="kc rd"><div className="kl">Total Disbursed</div><div className="kv">$8,820</div><div className="kd dn">71% of total budget used</div><div className="ki">📊</div></div>
            <div className="kc gn"><div className="kl">Remaining Budget</div><div className="kv">$3,580</div><div className="kd up">29% available</div><div className="ki">✓</div></div>
            <div className="kc yw"><div className="kl">Pending Requests</div><div className="kv">{QUEUE_DATA.length}</div><div className="kd nt">Awaiting your review</div><div className="ki">⏳</div></div>
          </div>

          {/* Budget burn trend chart */}
          <div style={{ background: 'var(--l1)', border: '1px solid var(--bs)', padding: '14px 18px', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>Monthly Budget Burn — Pizza Inn Shops</div>
                <div style={{ fontSize: 11, color: 'var(--ts)', fontFamily: "'IBM Plex Mono',monospace", marginTop: 2 }}>Cumulative spend per week · March 2025</div>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {[['Sh-03','#0f62fe'],['Sh-08','#da1e28'],['Sh-11','#6929c4'],['Sh-19','#24a148'],['Sh-22','#f1c21b']].map(([name, color]) => (
                  <span key={name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontFamily: "'IBM Plex Mono',monospace", color: 'var(--ts)' }}>
                    <span style={{ width: 12, height: 3, background: color, display: 'inline-block', borderRadius: 2 }} />
                    {name}
                  </span>
                ))}
              </div>
            </div>
            <LineChart data={BUDGET_TREND} color="#0f62fe" height={140} multiline={true} />
          </div>

          <div className="tbbar">
            <div className="tbt">Budget vs Disbursed — Pizza Inn Shops</div>
            <button className="ab sec" style={{ height: 34, fontSize: 12 }} onClick={() => setShowBudget(true)}>Set Budgets</button>
          </div>
          <table className="dt">
            <thead><tr><th>Shop</th><th>Location</th><th>Monthly Budget</th><th>Disbursed</th><th>Remaining</th><th>% Used</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {SHOPS.map(s => (
                <tr key={s.id}>
                  <td><strong>{s.id}</strong></td>
                  <td>{s.loc}</td>
                  <td>${s.budget.toLocaleString()}</td>
                  <td>${s.spent.toLocaleString()}</td>
                  <td>${(s.budget - s.spent).toLocaleString()}</td>
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
          <div className="kg c4">
            <div className="kc yw"><div className="kl">Pending Review</div><div className="kv">{QUEUE_DATA.length}</div><div className="kd nt">Awaiting validation</div><div className="ki">⏳</div></div>
            <div className="kc rd"><div className="kl">Over Budget Limit</div><div className="kv">{QUEUE_DATA.filter(q => q.budget === 'over').length}</div><div className="kd dn">Require exception approval</div><div className="ki">⚠</div></div>
            <div className="kc bl"><div className="kl">Total Queue Value</div><div className="kv">${QUEUE_DATA.reduce((s,q) => s+q.rawAmt, 0).toLocaleString()}</div><div className="kd nt">Pending disbursement</div><div className="ki">💳</div></div>
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
            <div className="tbt">Review Queue — Pizza Inn</div>
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
              {filteredQueue.length === 0
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
                        <button className="rb ap" onClick={() => setValidateTarget(q)}>Validate</button>
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
          <div className="ntf info" style={{ marginBottom: 16 }}>
            <div>
              <div className="ntf-t">Monthly Budget Configuration — Pizza Inn</div>
              <div className="ntf-b">Set per-shop limits and category caps. Threshold alerts trigger at 80% utilisation.</div>
            </div>
          </div>
          <div className="tbbar">
            <div className="tbt">Shop Budget Limits</div>
            <button className="ab pri" style={{ height: 34, fontSize: 12 }} onClick={() => setShowBudget(true)}>Edit Budgets</button>
          </div>
          <table className="dt">
            <thead><tr><th>Shop</th><th>Location</th><th>Monthly Budget</th><th>Disbursed</th><th>Remaining</th><th>% Used</th><th>80% Threshold</th><th>90% Alert</th><th>Status</th></tr></thead>
            <tbody>
              {SHOPS.map(s => (
                <tr key={s.id}>
                  <td><strong>{s.id}</strong></td>
                  <td>{s.loc}</td>
                  <td>${s.budget.toLocaleString()}</td>
                  <td>${s.spent.toLocaleString()}</td>
                  <td>${(s.budget - s.spent).toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 80, height: 6, background: 'var(--l3)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(s.pct, 100)}%`, background: pctColor(s.pct), transition: 'width 0.8s ease' }} />
                      </div>
                      <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, fontWeight: 600, color: pctColor(s.pct) }}>{s.pct}%</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--ts)' }}>${(s.budget * 0.8).toFixed(0)}</td>
                  <td style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--ts)' }}>${(s.budget * 0.9).toFixed(0)}</td>
                  <td><StatusTag type={s.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ height: 20 }} />
          <AuditLog title="Audit Log — Budget Changes" entries={LOGS.filter(l => l.text.includes('BUDGET') || l.text.includes('ALERT'))} />
        </>)}

        {tab !== 1 && (<><div style={{ height: 20 }} /><AuditLog title="Audit Log — Pizza Inn (Brand Accountant View)" entries={LOGS} /></>)}
      </div>

      <ValidateModal open={!!validateTarget} onClose={() => setValidateTarget(null)} request={validateTarget} />
      <BudgetModal open={showBudget} onClose={() => setShowBudget(false)} />
      <RejectModal
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        requestId={rejectTarget?.id}
        onConfirm={() => addToast('er', `${rejectTarget?.id} rejected`, 'Shop manager will be notified')}
      />
      <RequestDetailModal
        request={viewShop ? { id: viewShop.id, date: 'Mar 2025', cat: 'Budget View', purpose: `${viewShop.loc} — ${viewShop.pct}% of $${viewShop.budget.toLocaleString()} budget`, supplier: 'N/A', amt: `$${viewShop.spent.toLocaleString()} disbursed`, status: viewShop.status } : null}
        onClose={() => setViewShop(null)}
      />
    </>
  );
}
