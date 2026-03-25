import { useState } from 'react';
import { useApp } from '../context/AppContext';
import LineChart from '../components/shared/LineChart';

const MONTHS = ['March 2025', 'February 2025', 'January 2025', 'December 2024', 'November 2024'];
const BRANDS_LIST = ['All Brands', 'Chicken Inn', 'Pizza Inn', 'Creamy Inn', "Nando's", 'Steers', "Roco Mamma's"];

const REPORTS = [
  {
    id: 'RPT-001',
    title: 'Monthly Petty Cash Summary',
    desc: 'Complete breakdown of all petty cash disbursements by shop, category, and supplier. Includes budget utilisation rates and exception log.',
    icon: '💳',
    color: '#0f62fe',
    bg: '#e8f0fe',
    scope: ['manager', 'accountant', 'brandmgr', 'executive'],
    stats: [
      { label: 'Total Disbursed', val: '$19,396' },
      { label: 'Requests', val: '148' },
      { label: 'Utilisation', val: '65%' },
      { label: 'Exceptions', val: '4' },
    ],
    trend: [{ label: 'Wk1', value: 3200 }, { label: 'Wk2', value: 6800 }, { label: 'Wk3', value: 12400 }, { label: 'Wk4', value: 19396 }],
    pages: 12, size: '1.4 MB',
  },
  {
    id: 'RPT-002',
    title: 'Brand Expenditure Report',
    desc: 'Per-brand and per-shop expenditure analysis with variance to budget, trend lines, and category breakdowns. Suitable for board-level review.',
    icon: '📊',
    color: '#6929c4',
    bg: '#f6f2ff',
    scope: ['accountant', 'brandmgr', 'executive'],
    stats: [
      { label: 'Brands', val: '9' },
      { label: 'Shops', val: '57' },
      { label: 'Total Budget', val: '$31,000' },
      { label: 'Avg Utilisation', val: '62%' },
    ],
    trend: [{ label: 'Jan', value: 24200 }, { label: 'Feb', value: 27800 }, { label: 'Mar', value: 19396 }],
    pages: 18, size: '2.1 MB',
  },
  {
    id: 'RPT-003',
    title: 'InnBucks Sales Report',
    desc: 'Consolidated InnBucks transaction report including settlement status, basket sizes, reconciliation summary, and brand-level MoM comparisons.',
    icon: '📈',
    color: '#24a148',
    bg: '#defbe6',
    scope: ['brandmgr', 'executive'],
    stats: [
      { label: 'Total Sales', val: '$24,180' },
      { label: 'Transactions', val: '284' },
      { label: 'Avg Basket', val: '$85.14' },
      { label: 'MoM Change', val: '↑ 4.2%' },
    ],
    trend: [{ label: 'Mon', value: 3210 }, { label: 'Tue', value: 3890 }, { label: 'Wed', value: 2940 }, { label: 'Thu', value: 4120 }, { label: 'Fri', value: 5340 }, { label: 'Sat', value: 6180 }],
    pages: 8, size: '0.9 MB',
  },
  {
    id: 'RPT-004',
    title: 'Supplier Spend Analysis',
    desc: 'Supplier-level spend analytics including YTD totals, brand coverage, certification status, and trend indicators. Supports procurement review cycles.',
    icon: '🏭',
    color: '#6929c4',
    bg: '#f6f2ff',
    scope: ['accountant', 'procurement', 'executive'],
    stats: [
      { label: 'Active Suppliers', val: '16' },
      { label: 'MTD Spend', val: '$9,420' },
      { label: 'YTD Spend', val: '$56,660' },
      { label: 'Cert. Alerts', val: '3' },
    ],
    trend: [{ label: 'Jan', value: 8400 }, { label: 'Feb', value: 9100 }, { label: 'Mar', value: 9420 }],
    pages: 10, size: '1.2 MB',
  },
  {
    id: 'RPT-005',
    title: 'Exception & Audit Log Report',
    desc: 'Full audit trail of all system events, exceptions approved or rejected, login activity, and budget changes for the selected period.',
    icon: '📋',
    color: '#f1c21b',
    bg: '#fdf6dd',
    scope: ['accountant', 'admin', 'executive'],
    stats: [
      { label: 'Audit Events', val: '214' },
      { label: 'Exceptions', val: '6' },
      { label: 'Rejected', val: '11' },
      { label: 'Failed Logins', val: '3' },
    ],
    trend: [{ label: 'Wk1', value: 44 }, { label: 'Wk2', value: 68 }, { label: 'Wk3', value: 92 }, { label: 'Wk4', value: 214 }],
    pages: 14, size: '1.8 MB',
  },
  {
    id: 'RPT-006',
    title: 'Budget vs Actual Report',
    desc: 'Variance analysis between set budgets and actual disbursements at shop and brand level. Includes 80% and 90% threshold breach summaries.',
    icon: '⚖',
    color: '#da1e28',
    bg: '#fff1f1',
    scope: ['accountant', 'brandmgr'],
    stats: [
      { label: 'Shops ≥90%', val: '2' },
      { label: 'Shops ≥80%', val: '4' },
      { label: 'On Budget', val: '8' },
      { label: 'Avg Variance', val: '-$48' },
    ],
    trend: [{ label: 'Sh-03', value: 74 }, { label: 'Sh-08', value: 96 }, { label: 'Sh-11', value: 97 }, { label: 'Sh-19', value: 45 }, { label: 'Sh-22', value: 56 }],
    pages: 9, size: '1.1 MB',
  },
  {
    id: 'RPT-007',
    title: 'Shop Activity Report',
    desc: 'Summary of your shop\'s petty cash requests, payment history, budget usage and audit trail. Suitable for shop-level review and record-keeping.',
    icon: '🏪',
    color: '#0f62fe',
    bg: '#e8f0fe',
    scope: ['manager'],
    stats: [
      { label: 'Requests MTD', val: '4' },
      { label: 'Total Paid', val: '$500' },
      { label: 'Budget Used', val: '90%' },
      { label: 'Exceptions', val: '1' },
    ],
    trend: [{ label: 'Wk1', value: 120 }, { label: 'Wk2', value: 280 }, { label: 'Wk3', value: 400 }, { label: 'Wk4', value: 720 }],
    pages: 4, size: '0.4 MB',
  },
  {
    id: 'RPT-008',
    title: 'Supplier Certification Report',
    desc: 'Full listing of supplier certification status, expiry dates, and verification history. Flags upcoming renewals and compliance gaps.',
    icon: '📜',
    color: '#6929c4',
    bg: '#f6f2ff',
    scope: ['procurement'],
    stats: [
      { label: 'Verified', val: '6' },
      { label: 'Expiring 90d', val: '3' },
      { label: 'Unverified', val: '1' },
      { label: 'Total', val: '7' },
    ],
    trend: [{ label: 'Jan', value: 5 }, { label: 'Feb', value: 6 }, { label: 'Mar', value: 6 }],
    pages: 6, size: '0.7 MB',
  },
  {
    id: 'RPT-009',
    title: 'Product & Category Spend',
    desc: 'Category-level spend analytics with volume, value, and trend data. Identifies high-spend categories and potential consolidation opportunities.',
    icon: '📦',
    color: '#6929c4',
    bg: '#f6f2ff',
    scope: ['procurement'],
    stats: [
      { label: 'Categories', val: '5' },
      { label: 'MTD Spend', val: '$9,420' },
      { label: 'Top Category', val: 'Maintenance' },
      { label: 'Top Share', val: '37%' },
    ],
    trend: [{ label: 'Maint.', value: 6840 }, { label: 'Equip.', value: 4440 }, { label: 'Gas', value: 3210 }, { label: 'Clean', value: 2890 }, { label: 'Stat.', value: 1040 }],
    pages: 8, size: '1.0 MB',
  },
];

const RECENT = [
  { id: 'RPT-002', title: 'Brand Expenditure Report',     month: 'February 2025', by: 'C. Mutandwa', at: '21 Feb 09:12', size: '2.1 MB' },
  { id: 'RPT-001', title: 'Monthly Petty Cash Summary',   month: 'February 2025', by: 'D. Chinhoro', at: '20 Feb 16:44', size: '1.4 MB' },
  { id: 'RPT-004', title: 'Supplier Spend Analysis',      month: 'January 2025',  by: 'C. Mutandwa', at: '18 Jan 11:30', size: '1.2 MB' },
  { id: 'RPT-003', title: 'InnBucks Sales Report',        month: 'January 2025',  by: 'D. Chinhoro', at: '18 Jan 10:55', size: '0.9 MB' },
  { id: 'RPT-005', title: 'Exception & Audit Log Report', month: 'January 2025',  by: 'S. Moyo',     at: '15 Jan 14:20', size: '1.8 MB' },
  { id: 'RPT-007', title: 'Shop Activity Report',         month: 'February 2025', by: 'K. Mutasa',   at: '28 Feb 08:30', size: '0.4 MB' },
  { id: 'RPT-008', title: 'Supplier Certification Report',month: 'February 2025', by: 'R. Chikwanda',at: '26 Feb 14:10', size: '0.7 MB' },
];

const ROLE_TITLES = {
  manager:     { heading: 'Sh-14 Borrowdale — Chicken Inn', sub: 'Shop-level reports for petty cash and activity' },
  accountant:  { heading: 'Pizza Inn', sub: 'Brand accountant reports for petty cash, budgets, and suppliers' },
  brandmgr:    { heading: 'Chicken Inn', sub: 'Brand manager reports for approvals, InnBucks, and expenditure' },
  procurement: { heading: 'Head Office — All Brands', sub: 'Supplier, certification, and category spend reports' },
  executive:   { heading: 'Simbisa Group', sub: 'Group-wide petty cash, InnBucks, and supplier analytics' },
  admin:       { heading: 'System', sub: 'Audit and access reports' },
};

export default function ReportsDashboard() {
  const { session, addToast } = useApp();
  const role = session?.roleKey ?? 'executive';
  const [month, setMonth] = useState(MONTHS[0]);
  const [brand, setBrand] = useState('All Brands');
  const [tab, setTab] = useState(0);

  const visibleReports = REPORTS.filter(r => r.scope.includes(role));
  const roleInfo = ROLE_TITLES[role] || ROLE_TITLES.executive;

  const handleDownload = (r) => addToast('ok', `Generating ${r.id}`, `${r.title} · ${month} · PDF downloading…`);
  const handlePreview  = (r) => addToast('info', `Preview — ${r.id}`, `${r.title} · ${month} · Opening preview…`);

  const tabs = ['Report Library', 'Download History'];

  return (
    <>
      <div className="ph">
        <div className="bc">CVS <span>/</span> {roleInfo.heading} <span>/</span> Reports</div>
        <div className="pt">Reports & Exports</div>
        <div className="pd">{roleInfo.sub}</div>
        <div className="ptabs">
          {tabs.map((t, i) => (
            <button key={t} className={`ptab${tab === i ? ' on' : ''}`} onClick={() => setTab(i)}>{t}</button>
          ))}
        </div>
      </div>
      <div className="cnt">

        {/* ── Tab 0: Report Library ─────────────────────────────────── */}
        {tab === 0 && (<>
          <div className="kg c4">
            <div className="kc bl"><div className="kl">Available Reports</div><div className="kv">{visibleReports.length}</div><div className="kd nt">For your role</div><div className="ki">📄</div></div>
            <div className="kc gn"><div className="kl">Last Generated</div><div className="kv">21 Feb</div><div className="kd nt">Brand Expenditure</div><div className="ki">✓</div></div>
            <div className="kc yw"><div className="kl">Reporting Period</div><div className="kv">March 2025</div><div className="kd nt">Current month</div><div className="ki">📅</div></div>
            <div className="kc pr"><div className="kl">Total Downloads (QTD)</div><div className="kv">48</div><div className="kd nt">This quarter</div><div className="ki">⬇</div></div>
          </div>

          <div className="tbbar">
            <div className="tbt">Report Library</div>
            <select className="fsel" style={{ width: 170, height: 32, fontSize: 12 }} value={month} onChange={e => setMonth(e.target.value)}>
              {MONTHS.map(m => <option key={m}>{m}</option>)}
            </select>
            {(role === 'executive' || role === 'procurement') && (
              <select className="fsel" style={{ width: 150, height: 32, fontSize: 12 }} value={brand} onChange={e => setBrand(e.target.value)}>
                {BRANDS_LIST.map(b => <option key={b}>{b}</option>)}
              </select>
            )}
            <button className="ab sec" style={{ height: 32, fontSize: 12 }} onClick={() => addToast('ok', 'All reports queued', `${visibleReports.length} reports generating for ${month}…`)}>Download All</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16, marginBottom: 20 }}>
            {visibleReports.map(r => (
              <div key={r.id} style={{
                background: 'var(--l1)', border: '1px solid var(--bs)',
                padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 42, height: 42, background: r.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    {r.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--t1)' }}>{r.title}</div>
                    <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'var(--ts)', marginTop: 2 }}>{r.id} · PDF · {r.pages} pages · {r.size}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--ts)', lineHeight: 1.5 }}>{r.desc}</div>

                {/* Sparkline trend */}
                <div style={{ background: 'var(--l2)', padding: '8px 10px 4px' }}>
                  <div style={{ fontSize: 10, color: 'var(--ts)', fontFamily: "'IBM Plex Mono',monospace", marginBottom: 4 }}>Trend</div>
                  <LineChart data={r.trend} color={r.color} height={60} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {r.stats.map(s => (
                    <div key={s.label} style={{ background: 'var(--l2)', padding: '7px 10px' }}>
                      <div style={{ fontSize: 10, color: 'var(--ts)', fontFamily: "'IBM Plex Mono',monospace" }}>{s.label}</div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: r.color, fontFamily: "'IBM Plex Mono',monospace" }}>{s.val}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="ab pri" style={{ flex: 1, height: 32, fontSize: 12 }} onClick={() => handleDownload(r)}>
                    ⬇ Download PDF
                  </button>
                  <button className="ab sec" style={{ flex: 1, height: 32, fontSize: 12 }} onClick={() => handlePreview(r)}>
                    Preview
                  </button>
                </div>
                <div style={{ fontSize: 11, color: 'var(--ts)', fontFamily: "'IBM Plex Mono',monospace" }}>
                  Period: <strong>{month}</strong>{(role === 'executive' || role === 'procurement') && brand !== 'All Brands' ? ` · ${brand}` : ''}
                </div>
              </div>
            ))}
          </div>
        </>)}

        {/* ── Tab 1: Download History ─────────────────────────────── */}
        {tab === 1 && (<>
          <div className="kg c3">
            <div className="kc bl"><div className="kl">Total Downloads (QTD)</div><div className="kv">48</div><div className="kd nt">Q1 2025</div><div className="ki">⬇</div></div>
            <div className="kc gn"><div className="kl">Unique Reports Used</div><div className="kv">{visibleReports.length}</div><div className="kd nt">Report types</div><div className="ki">📄</div></div>
            <div className="kc yw"><div className="kl">Last Download</div><div className="kv">21 Feb</div><div className="kd nt">C. Mutandwa</div><div className="ki">📅</div></div>
          </div>
          <div className="tbbar">
            <div className="tbt">Recent Downloads</div>
            <button className="ab sec" style={{ height: 34, fontSize: 12 }} onClick={() => addToast('ok', 'History exported', 'Download history exported to CSV')}>Export CSV</button>
          </div>
          <table className="dt">
            <thead><tr><th>Report ID</th><th>Report Name</th><th>Period</th><th>Downloaded By</th><th>Date &amp; Time</th><th>Size</th><th></th></tr></thead>
            <tbody>
              {RECENT.filter(r => {
                const rpt = REPORTS.find(x => x.id === r.id);
                return rpt && rpt.scope.includes(role);
              }).map((r, i) => (
                <tr key={i}>
                  <td><code style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--info)' }}>{r.id}</code></td>
                  <td style={{ fontWeight: 500 }}>{r.title}</td>
                  <td style={{ fontSize: 12, color: 'var(--ts)', fontFamily: "'IBM Plex Mono',monospace" }}>{r.month}</td>
                  <td style={{ fontSize: 12, color: 'var(--ts)' }}>{r.by}</td>
                  <td style={{ fontSize: 12, color: 'var(--ts)', fontFamily: "'IBM Plex Mono',monospace" }}>{r.at}</td>
                  <td style={{ fontSize: 12, color: 'var(--ts)', fontFamily: "'IBM Plex Mono',monospace" }}>{r.size}</td>
                  <td><button className="rb vw" onClick={() => addToast('ok', `Re-downloading ${r.id}`, `${r.title} · ${r.month}`)}>Re-download</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>)}
      </div>
    </>
  );
}
