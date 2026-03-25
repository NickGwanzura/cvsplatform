import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import BrandChip from '../components/shared/BrandChip';
import StatusTag from '../components/shared/StatusTag';

const SUPPLIERS = [
  { name: 'CleanPro Supplies', cat: 'Cleaning',   spend: 2340, ytd: 14100, brands: [['Chicken Inn','bci'],['Pizza Inn','bcp']], trend: 12,  txns: 18, verified: true,  cert: '2026-03-01', wallet: 'IB-0773-8812' },
  { name: 'Swift Maintenance', cat: 'Maintenance',spend: 3120, ytd: 18920, brands: [['Pizza Inn','bcp'],['Steers','bcs']],       trend: 5,   txns: 22, verified: true,  cert: '2025-08-15', wallet: 'IB-0771-2244' },
  { name: 'ZimGas Ltd',        cat: 'Gas',        spend: 1870, ytd: 11220, brands: [['Chicken Inn','bci'],['Creamy Inn','bcc']], trend: -3,  txns: 14, verified: true,  cert: '2025-06-30', wallet: 'IB-0774-3344' },
  { name: 'OvenPro',           cat: 'Equipment',  spend: 1200, ytd: 7200,  brands: [['Pizza Inn','bcp']],                        trend: 22,  txns: 8,  verified: true,  cert: '2026-01-12', wallet: 'IB-0775-1100' },
  { name: 'AquaFix',           cat: 'Plumbing',   spend: 890,  ytd: 5340,  brands: [['Chicken Inn','bci']],                      trend: 0,   txns: 5,  verified: true,  cert: '2025-05-20', wallet: 'IB-0776-9900' },
  { name: 'FastFix Repairs',   cat: 'Maintenance',spend: 430,  ytd: 2580,  brands: [['Pizza Inn','bcp']],                        trend: null, txns: 3, verified: false, cert: null,          wallet: null },
  { name: 'OfficeFirst',       cat: 'Stationery', spend: 340,  ytd: 2040,  brands: [['Pizza Inn','bcp'],['Chicken Inn','bci']], trend: 8,   txns: 11, verified: true,  cert: '2025-12-01', wallet: 'IB-0779-4412' },
];

const PRODUCTS = [
  { name: 'Maintenance & Repairs', val: 6840, qty: 42, pct: 37, brands: 'All brands', trend: 8 },
  { name: 'Gas & Utilities',       val: 3210, qty: 28, pct: 17, brands: 'CI, CR, ND', trend: -2 },
  { name: 'Cleaning Supplies',     val: 2890, qty: 34, pct: 16, brands: 'All brands', trend: 5 },
  { name: 'Equipment',             val: 4440, qty: 12, pct: 24, brands: 'PI',          trend: 18 },
  { name: 'Stationery',            val: 1040, qty: 19, pct: 6,  brands: 'PI, CI',      trend: 0 },
];

const BREAKDOWN = [
  { supplier: 'CleanPro',      cat: 'Cleaning Supplies',  brand: 'Chicken Inn', shop: 'Sh-14', loc: 'Borrowdale', val: 280, qty: 3, last: '23 Mar' },
  { supplier: 'Swift Maint.', cat: 'Maintenance',         brand: 'Pizza Inn',   shop: 'Sh-03', loc: 'Avondale',   val: 450, qty: 1, last: '23 Mar' },
  { supplier: 'ZimGas',        cat: 'Gas & Utilities',    brand: 'Creamy Inn',  shop: 'Sh-11', loc: 'Highfield',  val: 310, qty: 2, last: '23 Mar' },
  { supplier: 'CleanPro',      cat: 'Cleaning Supplies',  brand: 'Pizza Inn',   shop: 'Sh-19', loc: 'Eastgate',   val: 95,  qty: 1, last: '23 Mar' },
  { supplier: 'OvenPro',       cat: 'Equipment Repair',   brand: 'Pizza Inn',   shop: 'Sh-08', loc: 'Sam Levy',   val: 450, qty: 1, last: '23 Mar' },
  { supplier: 'ZimGas',        cat: 'Gas & Utilities',    brand: 'Chicken Inn', shop: 'Sh-22', loc: 'Eastgate',   val: 120, qty: 1, last: '22 Mar' },
];

const trendColor = (t) => t > 0 ? 'var(--ok)' : t < 0 ? 'var(--er)' : 'var(--ts)';
const trendLabel = (t) => t === null ? '—' : t === 0 ? '0%' : `${t > 0 ? '↑' : '↓'} ${Math.abs(t)}%`;

export default function ProcDashboard() {
  const { addToast, activeTab } = useApp();
  const [tab, setTab] = useState(activeTab ?? 0);
  useEffect(() => { setTab(activeTab ?? 0); }, [activeTab]);
  const [brandFilter, setBrandFilter] = useState('All');
  const [catFilter, setCatFilter] = useState('All');
  const [search, setSearch] = useState('');

  const tabs = ['Overview', 'Supplier Trends', 'Product Trends', 'Supplier Portal'];

  const filteredBreakdown = BREAKDOWN.filter(r => {
    if (brandFilter !== 'All' && !r.brand.includes(brandFilter)) return false;
    if (catFilter !== 'All' && r.cat !== catFilter) return false;
    if (search && ![r.supplier, r.cat, r.brand, r.shop, r.loc].some(v => v.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  const uniqueCats = ['All', ...new Set(BREAKDOWN.map(r => r.cat))];

  return (
    <>
      <div className="ph">
        <div className="bc">CVS <span>/</span> Procurement <span>/</span> Dashboard</div>
        <div className="pt">Procurement Dashboard</div>
        <div className="pd">Supplier trends, product spend analysis and brand-store breakdown</div>
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
            <div className="kc bl"><div className="kl">Total Supplier Spend (MTD)</div><div className="kv">$18,420</div><div className="kd up">↑ 8% vs Feb</div><div className="ki">💳</div></div>
            <div className="kc gn"><div className="kl">Active Suppliers</div><div className="kv">{SUPPLIERS.filter(s => s.verified).length}</div><div className="kd nt">{SUPPLIERS.filter(s => !s.verified).length} pending verification</div><div className="ki">✓</div></div>
            <div className="kc yw"><div className="kl">Top Category</div><div className="kv" style={{ fontSize: 16, lineHeight: 1.4 }}>Maintenance</div><div className="kd nt">$6,840 MTD</div><div className="ki">🔧</div></div>
            <div className="kc rd"><div className="kl">Supplier Alerts</div><div className="kv">{SUPPLIERS.filter(s => s.cert && new Date(s.cert) < new Date('2025-07-01')).length}</div><div className="kd dn">Expiring certifications</div><div className="ki">⚠</div></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <div className="tbbar"><div className="tbt">Top Suppliers by Spend — MTD</div></div>
              <table className="dt">
                <thead><tr><th>Supplier</th><th>Category</th><th>MTD Spend</th><th>Brands</th><th>Trend</th></tr></thead>
                <tbody>
                  {SUPPLIERS.slice(0, 5).map(s => (
                    <tr key={s.name}>
                      <td><strong>{s.name}</strong></td>
                      <td style={{ fontSize: 12, color: 'var(--ts)' }}>{s.cat}</td>
                      <td><strong>${s.spend.toLocaleString()}</strong></td>
                      <td>{s.brands.map(([b, cls], i) => <span key={i} className={`bc2 ${cls}`} style={{ marginRight: 2, fontSize: 9 }}>{b.split(' ')[0] === 'Chicken' ? 'CI' : b.split(' ')[0] === 'Pizza' ? 'PI' : b.split(' ')[0] === 'Creamy' ? 'CR' : b === 'Steers' ? 'ST' : b[0]}</span>)}</td>
                      <td style={{ color: trendColor(s.trend), fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{trendLabel(s.trend)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <div className="tbbar"><div className="tbt">Top Products by Value — MTD</div></div>
              <table className="dt">
                <thead><tr><th>Product / Category</th><th>Total Value</th><th>Qty</th><th>Brands</th><th>vs Last Month</th></tr></thead>
                <tbody>
                  {PRODUCTS.map(p => (
                    <tr key={p.name}>
                      <td><strong>{p.name}</strong></td>
                      <td><strong>${p.val.toLocaleString()}</strong></td>
                      <td>{p.qty}</td>
                      <td style={{ fontSize: 11, color: 'var(--ts)' }}>{p.brands}</td>
                      <td style={{ color: trendColor(p.trend), fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{trendLabel(p.trend)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="tbbar">
            <div className="tbt">Supplier vs Product — By Brand, Store &amp; Location</div>
            <input className="srch" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
            <select className="fsel" style={{ width: 130, height: 32, fontSize: 12 }} value={brandFilter} onChange={e => setBrandFilter(e.target.value)}>
              <option value="All">All Brands</option><option value="Chicken Inn">Chicken Inn</option><option value="Pizza Inn">Pizza Inn</option><option value="Creamy Inn">Creamy Inn</option>
            </select>
            <select className="fsel" style={{ width: 140, height: 32, fontSize: 12 }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
              {uniqueCats.map(c => <option key={c}>{c}</option>)}
            </select>
            <button className="ab sec" style={{ height: 34, fontSize: 12 }} onClick={() => addToast('ok', 'Exported', `${filteredBreakdown.length} rows exported to CSV`)}>Export</button>
          </div>
          <table className="dt">
            <thead><tr><th>Supplier</th><th>Product Category</th><th>Brand</th><th>Shop</th><th>Location</th><th>Value</th><th>Qty</th><th>Last Transaction</th></tr></thead>
            <tbody>
              {filteredBreakdown.length === 0
                ? <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--ts)', padding: 20 }}>No results match filter</td></tr>
                : filteredBreakdown.map((r, i) => (
                  <tr key={i}>
                    <td><strong>{r.supplier}</strong></td>
                    <td>{r.cat}</td>
                    <td><BrandChip brand={r.brand} /></td>
                    <td>{r.shop}</td>
                    <td>{r.loc}</td>
                    <td><strong>${r.val.toLocaleString()}</strong></td>
                    <td>{r.qty}</td>
                    <td style={{ fontSize: 12, color: 'var(--ts)' }}>{r.last}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </>)}

        {/* ── Tab 1: Supplier Trends ────────────────────────────────────── */}
        {tab === 1 && (<>
          <div className="kg c4">
            <div className="kc bl"><div className="kl">Total MTD Spend</div><div className="kv">$14,890</div><div className="kd up">↑ 8% vs last month</div><div className="ki">💳</div></div>
            <div className="kc gn"><div className="kl">Verified Suppliers</div><div className="kv">{SUPPLIERS.filter(s => s.verified).length}</div><div className="kd nt">Active on platform</div><div className="ki">✓</div></div>
            <div className="kc yw"><div className="kl">Total Transactions</div><div className="kv">{SUPPLIERS.reduce((s, sup) => s + sup.txns, 0)}</div><div className="kd nt">This month</div><div className="ki">📊</div></div>
            <div className="kc rd"><div className="kl">Cert. Expiring</div><div className="kv">{SUPPLIERS.filter(s => s.cert && new Date(s.cert) < new Date('2025-07-01')).length}</div><div className="kd dn">Within 3 months</div><div className="ki">⚠</div></div>
          </div>
          <div className="tbbar"><div className="tbt">All Supplier Spend — MTD</div></div>
          <table className="dt">
            <thead><tr><th>Supplier</th><th>Category</th><th>MTD Spend</th><th>YTD Spend</th><th>Transactions</th><th>Brands</th><th>vs Last Month</th><th>Verified</th><th>Cert. Expiry</th></tr></thead>
            <tbody>
              {SUPPLIERS.map(s => (
                <tr key={s.name}>
                  <td><strong>{s.name}</strong></td>
                  <td style={{ fontSize: 12, color: 'var(--ts)' }}>{s.cat}</td>
                  <td><strong>${s.spend.toLocaleString()}</strong></td>
                  <td style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>${s.ytd.toLocaleString()}</td>
                  <td style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{s.txns}</td>
                  <td>{s.brands.map(([b, cls], i) => <span key={i} className={`bc2 ${cls}`} style={{ marginRight: 2, fontSize: 9 }}>{b.split(' ')[0] === 'Chicken' ? 'CI' : b.split(' ')[0] === 'Pizza' ? 'PI' : b.split(' ')[0] === 'Creamy' ? 'CR' : b === 'Steers' ? 'ST' : b[0]}</span>)}</td>
                  <td style={{ color: trendColor(s.trend), fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{trendLabel(s.trend)}</td>
                  <td>{s.verified ? <StatusTag type="active" label="VERIFIED" /> : <StatusTag type="pending" label="PENDING" />}</td>
                  <td style={{ fontSize: 11, fontFamily: "'IBM Plex Mono',monospace", color: s.cert && new Date(s.cert) < new Date('2025-07-01') ? 'var(--er-t)' : 'var(--ts)' }}>
                    {s.cert || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>)}

        {/* ── Tab 2: Product Trends ─────────────────────────────────────── */}
        {tab === 2 && (<>
          <div className="kg c3">
            <div className="kc bl"><div className="kl">Total Product Spend (MTD)</div><div className="kv">$18,420</div><div className="kd up">↑ 8% vs Feb</div><div className="ki">💳</div></div>
            <div className="kc gn"><div className="kl">Top Category</div><div className="kv" style={{ fontSize: 16 }}>Maintenance</div><div className="kd nt">$6,840 — 37% of spend</div><div className="ki">🔧</div></div>
            <div className="kc yw"><div className="kl">Total Requests</div><div className="kv">{PRODUCTS.reduce((s, p) => s + p.qty, 0)}</div><div className="kd nt">Across all categories</div><div className="ki">📊</div></div>
          </div>
          <div className="tbbar"><div className="tbt">Product Category Breakdown — MTD</div></div>
          <table className="dt">
            <thead><tr><th>Product / Category</th><th>Total Value</th><th>% of Spend</th><th>Requests</th><th>Avg per Request</th><th>Brands</th><th>vs Last Month</th></tr></thead>
            <tbody>
              {PRODUCTS.map(p => (
                <tr key={p.name}>
                  <td>
                    <strong>{p.name}</strong>
                    <div style={{ marginTop: 4, width: '100%', maxWidth: 140, height: 4, background: 'var(--l3)' }}>
                      <div style={{ height: '100%', width: `${p.pct}%`, background: 'var(--int)' }} />
                    </div>
                  </td>
                  <td><strong>${p.val.toLocaleString()}</strong></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 60, height: 6, background: 'var(--l3)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${p.pct}%`, background: 'var(--int)' }} />
                      </div>
                      <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, fontWeight: 600 }}>{p.pct}%</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{p.qty}</td>
                  <td style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>${Math.round(p.val / p.qty).toLocaleString()}</td>
                  <td style={{ fontSize: 11, color: 'var(--ts)' }}>{p.brands}</td>
                  <td style={{ color: trendColor(p.trend), fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{trendLabel(p.trend)}</td>
                </tr>
              ))}
              <tr style={{ background: 'var(--l2)' }}>
                <td><strong>TOTAL</strong></td>
                <td><strong>${PRODUCTS.reduce((s, p) => s + p.val, 0).toLocaleString()}</strong></td>
                <td><span style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700 }}>100%</span></td>
                <td style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{PRODUCTS.reduce((s, p) => s + p.qty, 0)}</td>
                <td>—</td><td>—</td><td>—</td>
              </tr>
            </tbody>
          </table>
        </>)}

        {/* ── Tab 3: Supplier Portal ────────────────────────────────────── */}
        {tab === 3 && (<>
          <div className="ntf info" style={{ marginBottom: 16 }}>
            <div>
              <div className="ntf-t">Supplier Verification Portal</div>
              <div className="ntf-b">Manage supplier credentials, InnBucks wallet numbers and certification status. New suppliers must be verified before shops can raise requests.</div>
            </div>
          </div>
          <div className="kg c4">
            <div className="kc gn"><div className="kl">Verified Suppliers</div><div className="kv">{SUPPLIERS.filter(s=>s.verified).length}</div><div className="kd nt">Active on platform</div><div className="ki">✓</div></div>
            <div className="kc yw"><div className="kl">Pending Verification</div><div className="kv">{SUPPLIERS.filter(s=>!s.verified).length}</div><div className="kd nt">Awaiting review</div><div className="ki">⏳</div></div>
            <div className="kc rd"><div className="kl">Cert. Expiring (3mo)</div><div className="kv">{SUPPLIERS.filter(s=>s.cert&&new Date(s.cert)<new Date('2025-07-01')).length}</div><div className="kd dn">Action required</div><div className="ki">⚠</div></div>
            <div className="kc bl"><div className="kl">Brands Covered</div><div className="kv">9</div><div className="kd nt">All brands onboarded</div><div className="ki">🏷</div></div>
          </div>
          <div className="tbbar">
            <div className="tbt">Supplier Registry</div>
            <button className="ab pri" style={{ height: 34, fontSize: 12 }} onClick={() => addToast('info', 'Supplier registration', 'Open the New Request form to register a supplier')}>+ Register Supplier</button>
          </div>
          <table className="dt">
            <thead><tr><th>Supplier</th><th>Category</th><th>InnBucks Wallet</th><th>Verified</th><th>Cert. Expiry</th><th>MTD Spend</th><th>Brands</th><th>Action</th></tr></thead>
            <tbody>
              {SUPPLIERS.map(s => (
                <tr key={s.name}>
                  <td><strong>{s.name}</strong></td>
                  <td style={{ fontSize: 12, color: 'var(--ts)' }}>{s.cat}</td>
                  <td>
                    {s.wallet
                      ? <code style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--int)' }}>{s.wallet}</code>
                      : <span style={{ color: 'var(--ts)', fontSize: 12 }}>—</span>
                    }
                  </td>
                  <td>{s.verified ? <StatusTag type="active" label="VERIFIED" /> : <StatusTag type="pending" label="PENDING" />}</td>
                  <td style={{ fontSize: 11, fontFamily: "'IBM Plex Mono',monospace", color: s.cert && new Date(s.cert) < new Date('2025-07-01') ? 'var(--er-t)' : 'var(--ts)' }}>
                    {s.cert || '—'}
                    {s.cert && new Date(s.cert) < new Date('2025-07-01') && <span style={{ color: 'var(--er)', marginLeft: 4 }}>⚠</span>}
                  </td>
                  <td><strong>${s.spend.toLocaleString()}</strong></td>
                  <td>{s.brands.map(([b, cls], i) => <span key={i} className={`bc2 ${cls}`} style={{ marginRight: 2, fontSize: 9 }}>{b[0]}{b.split(' ')[1]?.[0]||''}</span>)}</td>
                  <td>
                    <div className="ra">
                      {!s.verified && <button className="rb ap" onClick={() => addToast('ok', `${s.name} verified`, 'Supplier is now active on the platform')}>Verify</button>}
                      <button className="rb ed" onClick={() => addToast('info', `Editing ${s.name}`, 'Supplier editor opened')}>Edit</button>
                      {s.cert && new Date(s.cert) < new Date('2025-07-01') && <button className="rb rv" onClick={() => addToast('wa', 'Cert renewal sent', `${s.name} notified to renew certification`)}>Renew Cert</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>)}
      </div>
    </>
  );
}
