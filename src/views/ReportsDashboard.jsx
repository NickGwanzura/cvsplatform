import { useState } from 'react';
import { useApp } from '../context/AppContext';
import Breadcrumbs from '../components/shared/Breadcrumbs';
import EndpointPendingBanner from '../components/shared/EndpointPendingBanner';

const BRANDS_LIST = ['All Brands', 'Chicken Inn', 'Pizza Inn', 'Creamy Inn', "Nando's", 'Steers', "Roco Mamma's", 'Ocean Basket', 'Hefelies', "Pastino's"];
const SHOPS_LIST = ['All Shops'];
const LOCATIONS = ['All Locations'];
const TIMEFRAMES = ['This Month', 'Last Month', 'This Quarter', 'Last Quarter', 'This Year', 'Custom'];

const REPORTS = [];

const RECENT = [];

const ROLE_TITLES = {
  manager:     { heading: 'Shop Reports', sub: 'Shop-level reports for petty cash and activity' },
  accountant:  { heading: 'Brand Reports', sub: 'Brand accountant reports for petty cash, budgets, and suppliers' },
  brandmgr:    { heading: 'Brand Reports', sub: 'Brand manager reports for approvals, InnBucks, and expenditure' },
  procurement: { heading: 'Procurement Reports', sub: 'Supplier, certification, and category spend reports' },
  executive:   { heading: 'Group Reports', sub: 'Group-wide petty cash, InnBucks, and supplier analytics' },
  admin:       { heading: 'System Reports', sub: 'Audit and access reports' },
};

export default function ReportsDashboard() {
  const { session, addToast, brandFilter, setBrandFilter } = useApp();
  const role = session?.roleKey ?? 'executive';
  const [tab, setTab] = useState(0);

  const brand = brandFilter;
  const setBrand = setBrandFilter;
  const [shop, setShop] = useState('All Shops');
  const [location, setLocation] = useState('All Locations');
  const [timeframe, setTimeframe] = useState('This Month');
  const [customFrom, setCustomFrom] = useState('2025-03-01');
  const [customTo, setCustomTo] = useState('2025-03-31');

  const visibleReports = REPORTS.filter(r => r.scope.includes(role));
  const roleInfo = ROLE_TITLES[role] || ROLE_TITLES.executive;

  const handleDownload = (r) => addToast('ok', `Generating ${r.id}`, `${r.title} · ${timeframe}${brand !== 'All Brands' ? ` · ${brand}` : ''} · PDF downloading…`);
  const handlePreview  = (r) => addToast('info', `Preview — ${r.id}`, `${r.title} · ${timeframe}${brand !== 'All Brands' ? ` · ${brand}` : ''} · Opening preview…`);

  const filterSummary = [timeframe, brand !== 'All Brands' ? brand : null, shop !== 'All Shops' ? shop : null, location !== 'All Locations' ? location : null].filter(Boolean).join(' · ');
  const customRange = timeframe === 'Custom' ? `${customFrom} — ${customTo}` : '';

  const tabs = ['Report Library', 'Custom Reports'];

  return (
    <>
      <div className="ph">
        <Breadcrumbs items={[
          { label: 'CVS' },
          { label: roleInfo.heading },
          { label: 'Reports' },
        ]} />
        <div className="ptabs">
          {tabs.map((t, i) => (
            <button key={t} className={`ptab${tab === i ? ' on' : ''}`} onClick={() => setTab(i)}>{t}</button>
          ))}
        </div>
      </div>
      <div className="cnt">
        <EndpointPendingBanner
          feature="The reports library and recent-downloads history"
          endpoints={['GET /api/v1/reports', 'POST /api/v1/reports/:id/generate', 'GET /api/v1/reports/export']}
          note="reports.{shop, brand, executive}.view + reports.export permissions are seeded across roles, but no /reports route is registered on the backend yet."
        />

        {/* ── Tab 0: Report Library ─────────────────────────────────── */}
        {tab === 0 && (<>
          <div className="kg c4">
            <div className="kc bl"><div className="kl">Available Reports</div><div className="kv">{visibleReports.length}</div><div className="kd nt">For your role</div><div className="ki">📄</div></div>
            <div className="kc gn"><div className="kl">Last Generated</div><div className="kv">21 Feb</div><div className="kd nt">Brand Expenditure</div><div className="ki">✓</div></div>
            <div className="kc yw"><div className="kl">Reporting Period</div><div className="kv">{timeframe === 'Custom' ? 'Custom' : timeframe}</div><div className="kd nt">{timeframe === 'Custom' ? customRange : 'Selected period'}</div><div className="ki">📅</div></div>
            <div className="kc pr"><div className="kl">Total Downloads (QTD)</div><div className="kv">—</div><div className="kd nt">This quarter</div><div className="ki">⬇</div></div>
          </div>

          <div className="tbbar">
            <div className="tbt">Report Library</div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            <select className="fsel" style={{ width: 150, height: 32, fontSize: 12 }} value={brand} onChange={e => setBrand(e.target.value)}>
              {BRANDS_LIST.map(b => <option key={b}>{b}</option>)}
            </select>
            <select className="fsel" style={{ width: 150, height: 32, fontSize: 12 }} value={shop} onChange={e => setShop(e.target.value)}>
              {SHOPS_LIST.map(s => <option key={s}>{s}</option>)}
            </select>
            <select className="fsel" style={{ width: 150, height: 32, fontSize: 12 }} value={location} onChange={e => setLocation(e.target.value)}>
              {LOCATIONS.map(l => <option key={l}>{l}</option>)}
            </select>
            <select className="fsel" style={{ width: 150, height: 32, fontSize: 12 }} value={timeframe} onChange={e => setTimeframe(e.target.value)}>
              {TIMEFRAMES.map(t => <option key={t}>{t}</option>)}
            </select>
            {timeframe === 'Custom' && (
              <>
                <input className="fin" type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} style={{ width: 140, height: 32, fontSize: 12 }} />
                <input className="fin" type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} style={{ width: 140, height: 32, fontSize: 12 }} />
              </>
            )}
            <button className="ab sec" style={{ height: 32, fontSize: 12 }} onClick={() => addToast('ok', 'All reports queued', `${visibleReports.length} reports generating for ${filterSummary}…`)}>Download All</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16, marginBottom: 20 }}>
            {visibleReports.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--ts)', padding: 40 }}>No reports available.</div>
            ) : visibleReports.map(r => (
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
                  Period: <strong>{timeframe === 'Custom' ? customRange : timeframe}</strong>{brand !== 'All Brands' ? ` · ${brand}` : ''}{shop !== 'All Shops' ? ` · ${shop}` : ''}{location !== 'All Locations' ? ` · ${location}` : ''}
                </div>
              </div>
            ))}
          </div>
        </>)}

        {/* ── Tab 1: Download History ─────────────────────────────── */}
        {tab === 1 && (<>
          <div className="kg c3">
            <div className="kc bl"><div className="kl">Total Downloads (QTD)</div><div className="kv">—</div><div className="kd nt">—</div><div className="ki">⬇</div></div>
            <div className="kc gn"><div className="kl">Unique Reports Used</div><div className="kv">{visibleReports.length}</div><div className="kd nt">Report types</div><div className="ki">📄</div></div>
            <div className="kc yw"><div className="kl">Last Download</div><div className="kv">—</div><div className="kd nt">—</div><div className="ki">📅</div></div>
          </div>
          <div className="tbbar">
            <div className="tbt">Recent Downloads</div>
            <button className="ab sec" style={{ height: 34, fontSize: 12 }} onClick={() => addToast('ok', 'History exported', 'Download history exported to CSV')}>Export CSV</button>
          </div>
          <table className="dt">
            <thead><tr><th>Report ID</th><th>Report Name</th><th>Period</th><th>Downloaded By</th><th>Date &amp; Time</th><th>Size</th><th></th></tr></thead>
            <tbody>
              {RECENT.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--ts)', padding: 20 }}>No downloads yet.</td></tr>
              ) : RECENT.filter(r => {
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
