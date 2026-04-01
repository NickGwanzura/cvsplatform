import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatMoney, formatMoneyShort, convert } from '../lib/currency';
import BrandChip from '../components/shared/BrandChip';
import StatusTag from '../components/shared/StatusTag';
import CvsModal from '../components/modals/CvsModal';
import DataTable from '../components/shared/DataTable';
import Breadcrumbs from '../components/shared/Breadcrumbs';

const BRANDS_LIST = ['All Brands', 'Chicken Inn', 'Pizza Inn', 'Creamy Inn', "Nando's", 'Steers', "Roco Mamma's", 'Ocean Basket', 'Hefelies', "Pastino's"];
const SHOPS_LIST = ['All Shops', 'Sh-03 Avondale', 'Sh-07 Avondale', 'Sh-08 Sam Levy', 'Sh-11 Highfield', 'Sh-14 Borrowdale', 'Sh-19 Eastgate', 'Sh-22 Eastgate', 'Sh-05 Borrowdale'];
const LOCATIONS = ['All Locations', 'Avondale', 'Borrowdale', 'Eastgate', 'Sam Levy', 'Highfield'];
const TIMEFRAMES = ['Today', 'This Week', 'This Month', 'This Quarter', 'Custom'];

const BRANDS_DATA = [
  { brand: 'Chicken Inn',  shop: 'Sh-14 Borrowdale',  location: 'Borrowdale', budget: 8000,  disbursed: 4880, shops: 14, alerts: 1, alertType: 'monitor' },
  { brand: 'Pizza Inn',    shop: 'Sh-03 Avondale',    location: 'Avondale',   budget: 7200,  disbursed: 5328, shops: 12, alerts: 2, alertType: 'alert' },
  { brand: 'Creamy Inn',   shop: 'Sh-11 Highfield',   location: 'Highfield',  budget: 4000,  disbursed: 1920, shops: 8,  alerts: 0 },
  { brand: "Nando's",      shop: 'Sh-07 Avondale',    location: 'Avondale',   budget: 3200,  disbursed: 2624, shops: 6,  alerts: 1, alertType: 'alert' },
  { brand: 'Steers',       shop: 'Sh-19 Eastgate',    location: 'Eastgate',   budget: 2400,  disbursed: 1320, shops: 5,  alerts: 0 },
  { brand: "Roco Mamma's", shop: 'Sh-05 Borrowdale',  location: 'Borrowdale', budget: 2000,  disbursed: 1380, shops: 4,  alerts: 0 },
  { brand: 'Ocean Basket', shop: 'Sh-22 Eastgate',    location: 'Eastgate',   budget: 1600,  disbursed: 688,  shops: 3,  alerts: 0 },
  { brand: 'Hefelies',     shop: 'Sh-08 Sam Levy',    location: 'Sam Levy',   budget: 1200,  disbursed: 444,  shops: 2,  alerts: 0 },
  { brand: "Pastino's",    shop: 'Sh-11 Highfield',   location: 'Highfield',  budget: 1400,  disbursed: 812,  shops: 3,  alerts: 0 },
];

const EXPENSES = [
  { id: 'PC-0041', date: '23 Mar', brand: 'Chicken Inn', shop: 'Sh-14 Borrowdale', location: 'Borrowdale', cat: 'Cleaning', supplier: 'CleanPro', amt: 180, status: 'review', wallet: 'IB-0773-8812', mgr: 'K. Mutasa' },
  { id: 'PC-0044', date: '23 Mar', brand: 'Pizza Inn',   shop: 'Sh-03 Avondale',   location: 'Avondale',   cat: 'Maintenance', supplier: 'OvenPro', amt: 450, status: 'over', wallet: 'IB-0775-1122', mgr: 'T. Ndlovu' },
  { id: 'PC-0039', date: '18 Mar', brand: 'Chicken Inn', shop: 'Sh-07 Avondale',   location: 'Avondale',   cat: 'Gas', supplier: 'ZimGas', amt: 120, status: 'paid', wallet: 'IB-0774-3344', mgr: 'P. Chiriseri', txn: 'IB-TXN-93391' },
  { id: 'PC-0038', date: '17 Mar', brand: "Nando's",     shop: 'Sh-07 Avondale',   location: 'Avondale',   cat: 'Cleaning', supplier: 'CleanPro', amt: 95, status: 'paid', wallet: 'IB-0776-9900', mgr: 'M. Dube', txn: 'IB-TXN-93380' },
  { id: 'PC-0036', date: '15 Mar', brand: 'Creamy Inn',  shop: 'Sh-11 Highfield',  location: 'Highfield',  cat: 'Stationery', supplier: 'OfficeFirst', amt: 55, status: 'paid', wallet: 'IB-0778-3312', mgr: 'B. Moyo', txn: 'IB-TXN-93350' },
  { id: 'PC-0035', date: '12 Mar', brand: 'Steers',      shop: 'Sh-19 Eastgate',   location: 'Eastgate',   cat: 'Maintenance', supplier: 'Swift Maintenance', amt: 200, status: 'paid', wallet: 'IB-0771-2244', mgr: 'R. Mhondoro', txn: 'IB-TXN-93340' },
  { id: 'PC-0033', date: '10 Mar', brand: 'Pizza Inn',   shop: 'Sh-08 Sam Levy',   location: 'Sam Levy',   cat: 'Emergency', supplier: 'AquaFix', amt: 280, status: 'rejected', wallet: 'IB-0772-8190', mgr: 'S. Gumbo' },
  { id: 'PC-0031', date: '08 Mar', brand: "Roco Mamma's",shop: 'Sh-05 Borrowdale', location: 'Borrowdale', cat: 'Gas', supplier: 'ZimGas', amt: 130, status: 'paid', wallet: 'IB-0773-9910', mgr: 'J. Moyo', txn: 'IB-TXN-93310' },
];

const INNBUCKS_DATA = [
  { brand: 'Chicken Inn',  shop: 'Sh-14 Borrowdale', location: 'Borrowdale', sales: 8420,  txns: 98, avg: 85.92,  trend: 6 },
  { brand: 'Pizza Inn',    shop: 'Sh-03 Avondale',   location: 'Avondale',   sales: 6910,  txns: 74, avg: 93.38,  trend: 2 },
  { brand: 'Creamy Inn',   shop: 'Sh-11 Highfield',  location: 'Highfield',  sales: 3840,  txns: 52, avg: 73.85,  trend: -4 },
  { brand: "Nando's",      shop: 'Sh-07 Avondale',   location: 'Avondale',   sales: 2890,  txns: 31, avg: 93.23,  trend: 11 },
  { brand: 'Steers',       shop: 'Sh-19 Eastgate',   location: 'Eastgate',   sales: 2120,  txns: 29, avg: 73.10,  trend: 0 },
  { brand: "Roco Mamma's", shop: 'Sh-05 Borrowdale', location: 'Borrowdale', sales: null,  txns: null, avg: null, trend: null, notLive: true },
];

const SUPPLIER_TRENDS = [
  { name: 'Swift Maintenance', mtd: 3120, ytd: 18920, brands: 'PI, ST, CI', trend: 5, brandList: ['Pizza Inn', 'Steers', 'Chicken Inn'], shop: 'Sh-19 Eastgate', location: 'Eastgate' },
  { name: 'CleanPro Supplies', mtd: 2340, ytd: 14100, brands: 'CI, PI, ND', trend: 12, brandList: ['Chicken Inn', 'Pizza Inn', "Nando's"], shop: 'Sh-14 Borrowdale', location: 'Borrowdale' },
  { name: 'ZimGas Ltd',        mtd: 1870, ytd: 11220, brands: 'CI, CR, ND', trend: -3, brandList: ['Chicken Inn', 'Creamy Inn', "Nando's"], shop: 'Sh-07 Avondale', location: 'Avondale' },
  { name: 'OvenPro',           mtd: 1200, ytd: 7200,  brands: 'PI',          trend: 22, brandList: ['Pizza Inn'], shop: 'Sh-03 Avondale', location: 'Avondale' },
  { name: 'AquaFix',           mtd: 890,  ytd: 5340,  brands: 'CI',          trend: 0,  brandList: ['Chicken Inn'], shop: 'Sh-14 Borrowdale', location: 'Borrowdale' },
];

const pctOf = (a, b) => Math.round((a / b) * 100);
const pctColor = (p) => p >= 90 ? 'var(--er)' : p >= 70 ? 'var(--wa-t)' : 'var(--ok-t)';
const trendColor = (t) => t > 0 ? 'var(--ok)' : t < 0 ? 'var(--er)' : 'var(--ts)';
const trendLabel = (t) => t === null ? '—' : t === 0 ? '0%' : `${t > 0 ? '↑' : '↓'} ${Math.abs(t)}%`;

export default function ExecDashboard() {
  const { activeTab, brandFilter, setBrandFilter, currency } = useApp();
  const [tab, setTab] = useState(activeTab ?? 0);
  useEffect(() => { setTab(activeTab ?? 0); }, [activeTab]);

  const [shopFilter, setShopFilter] = useState('All Shops');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [timeframe, setTimeframe] = useState('This Month');
  const [customFrom, setCustomFrom] = useState('2025-03-01');
  const [customTo, setCustomTo] = useState('2025-03-23');

  const [detailItem, setDetailItem] = useState(null);
  const [detailType, setDetailType] = useState('');
  const [catFilter, setCatFilter] = useState(null);
  const REPORT_METRICS = [
    { id: 'petty-cash', label: 'Petty Cash', icon: '💳' },
    { id: 'innbucks',   label: 'InnBucks Sales', icon: '📈' },
    { id: 'suppliers',  label: 'Supplier Spend', icon: '🏭' },
    { id: 'budget',     label: 'Budget Utilisation', icon: '📊' },
  ];
  const [reportMetrics, setReportMetrics] = useState(['petty-cash', 'innbucks']);
  const [reportGroupBy, setReportGroupBy] = useState('brand');
  const toggleMetric = (id) => setReportMetrics(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);

  const matchesFilters = (item) => {
    if (brandFilter !== 'All Brands' && item.brand !== brandFilter) return false;
    if (shopFilter !== 'All Shops' && item.shop !== shopFilter) return false;
    if (locationFilter !== 'All Locations' && item.location !== locationFilter) return false;
    return true;
  };

  const filteredBrands = BRANDS_DATA.filter(matchesFilters);
  const filteredExpenses = EXPENSES.filter(matchesFilters);
  const filteredInnBucks = INNBUCKS_DATA.filter(matchesFilters);
  const filteredSuppliers = SUPPLIER_TRENDS.filter(s => {
    if (brandFilter !== 'All Brands' && !s.brandList.includes(brandFilter)) return false;
    if (locationFilter !== 'All Locations' && s.location !== locationFilter) return false;
    if (shopFilter !== 'All Shops' && s.shop !== shopFilter) return false;
    return true;
  });

  const totalBudget = filteredBrands.reduce((s, b) => s + b.budget, 0);
  const totalDisbursed = filteredBrands.reduce((s, b) => s + b.disbursed, 0);
  const totalSales = filteredInnBucks.filter(b => !b.notLive).reduce((s, b) => s + b.sales, 0);
  const totalTxns = filteredInnBucks.filter(b => !b.notLive).reduce((s, b) => s + b.txns, 0);

  const openDetail = (item, type) => {
    setDetailItem(item);
    setDetailType(type);
  };

  const tabs = ['Group Overview', 'Brand Breakdown', 'Petty Cash Expenses', 'InnBucks Sales', 'Supplier Analytics', 'Custom Reports'];

  const filterBar = (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
      <select className="fsel" style={{ width: 150, height: 32, fontSize: 12 }} value={brandFilter} onChange={e => setBrandFilter(e.target.value)}>
        {BRANDS_LIST.map(b => <option key={b}>{b}</option>)}
      </select>
      <select className="fsel" style={{ width: 150, height: 32, fontSize: 12 }} value={shopFilter} onChange={e => setShopFilter(e.target.value)}>
        {SHOPS_LIST.map(s => <option key={s}>{s}</option>)}
      </select>
      <select className="fsel" style={{ width: 150, height: 32, fontSize: 12 }} value={locationFilter} onChange={e => setLocationFilter(e.target.value)}>
        {LOCATIONS.map(l => <option key={l}>{l}</option>)}
      </select>
      <select className="fsel" style={{ width: 140, height: 32, fontSize: 12 }} value={timeframe} onChange={e => setTimeframe(e.target.value)}>
        {TIMEFRAMES.map(t => <option key={t}>{t}</option>)}
      </select>
      {timeframe === 'Custom' && (
        <>
          <input className="fin" type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} style={{ width: 140, height: 32, fontSize: 12 }} />
          <input className="fin" type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} style={{ width: 140, height: 32, fontSize: 12 }} />
        </>
      )}
    </div>
  );

  return (
    <>
      <div className="ph">
        <Breadcrumbs items={[
          { label: 'CVS' },
          { label: 'Executive', nav: { v: 'exec-dashboard', lb: 'Group Overview' }, navIdx: 0 },
          { label: 'Overview' },
        ]} />
        <div className="pt">Executive Dashboard — Simbisa Group</div>
        <div className="pd">Group-wide petty cash, InnBucks sales and supplier intelligence · Dual currency: USD / ZWL</div>
        <div className="ptabs">
          {tabs.map((t, i) => (
            <button key={t} className={`ptab${tab === i ? ' on' : ''}`} onClick={() => setTab(i)}>{t}</button>
          ))}
        </div>
      </div>
      <div className="cnt">
        {filterBar}

        {/* ── Tab 0: Group Overview ─────────────────────────────────────── */}
        {tab === 0 && (<>
          <div className="kg c4">
            <div className="kc bl"><div className="kl">Total Petty Cash Disbursed (MTD)</div><div className="kv">{formatMoneyShort(totalDisbursed, currency)}</div><div className="kd up">↑ 8% vs February</div><div className="ki">💳</div></div>
            <div className="kc gn"><div className="kl">InnBucks Sales — All Brands</div><div className="kv">{formatMoneyShort(totalSales, currency)}</div><div className="kd up">↑ Today's total</div><div className="ki">📈</div></div>
            <div className="kc yw"><div className="kl">Total Budget (MTD)</div><div className="kv">{formatMoneyShort(totalBudget, currency)}</div><div className="kd nt">{totalBudget > 0 ? pctOf(totalDisbursed, totalBudget) : 0}% utilised</div><div className="ki">📊</div></div>
            <div className="kc rd"><div className="kl">Threshold Alerts</div><div className="kv">{filteredBrands.reduce((s,b) => s+b.alerts,0)}</div><div className="kd dn">Shops over 80% limit</div><div className="ki">🚨</div></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <div className="tbbar"><div className="tbt">Expenditure — Filtered Brands (MTD)</div></div>
              <DataTable
                columns={[
                  { label: 'Brand', key: 'brand' },
                  { label: 'Budget', key: 'budget', barKey: 'budget' },
                  { label: 'Disbursed', key: 'disbursed', barKey: 'disbursed' },
                  { label: '% Used', key: 'pct' },
                ]}
                data={filteredBrands.map(b => ({
                  ...b,
                  brand: <BrandChip brand={b.brand} />,
                  budget: formatMoneyShort(b.budget, currency),
                  disbursed: formatMoneyShort(b.disbursed, currency),
                  pct: <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600, color: pctColor(pctOf(b.disbursed, b.budget)) }}>{pctOf(b.disbursed, b.budget)}%</span>,
                }))}
                onRowClick={(row) => openDetail(filteredBrands.find(b => b.brand === (typeof row.brand === 'string' ? row.brand : '')) || row, 'brand-expenditure')}
              />
            </div>

            <div>
              <div className="tbbar"><div className="tbt">InnBucks Sales — Filtered Brands</div></div>
              <DataTable
                columns={[
                  { label: 'Brand', key: 'brand' },
                  { label: 'Sales', key: 'sales', barKey: 'salesRaw' },
                  { label: 'Transactions', key: 'txns' },
                  { label: 'Avg Basket', key: 'avg' },
                  { label: 'vs Yesterday', key: 'trend' },
                ]}
                data={filteredInnBucks.map(b => ({
                  ...b,
                  brand: <BrandChip brand={b.brand} />,
                  salesRaw: b.sales || 0,
                  sales: b.notLive ? <strong>—</strong> : <strong>{formatMoneyShort(b.sales, currency)}</strong>,
                  txns: b.notLive ? 'Not live' : b.txns,
                  avg: b.avg ? formatMoney(b.avg, currency) : '—',
                  trend: <span style={{ color: trendColor(b.trend), fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{trendLabel(b.trend)}</span>,
                }))}
                onRowClick={(row) => !row.notLive && openDetail(row, 'innbucks')}
              />
              <div style={{ height: 16 }} />
              <div className="tbbar"><div className="tbt">Supplier Analytics — Group Level</div></div>
              <DataTable
                columns={[
                  { label: 'Supplier', key: 'name' },
                  { label: 'MTD Spend', key: 'mtd', barKey: 'mtdRaw' },
                  { label: 'YTD Spend', key: 'ytd' },
                  { label: 'Brands', key: 'brands' },
                  { label: 'Trend', key: 'trend' },
                ]}
                data={filteredSuppliers.slice(0, 3).map(s => ({
                  ...s,
                  name: <strong>{s.name}</strong>,
                  mtdRaw: s.mtd,
                  mtd: <strong>{formatMoneyShort(s.mtd, currency)}</strong>,
                  ytd: <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{formatMoneyShort(s.ytd, currency)}</span>,
                  trend: <span style={{ color: trendColor(s.trend), fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{trendLabel(s.trend)}</span>,
                }))}
                onRowClick={(row) => openDetail(row, 'supplier')}
              />
            </div>
          </div>
        </>)}

        {/* ── Tab 1: Brand Breakdown ────────────────────────────────────── */}
        {tab === 1 && (<>
          <div className="kg c4">
            <div className="kc bl"><div className="kl">Brands on Platform</div><div className="kv">{filteredBrands.length}</div><div className="kd nt">All reporting</div><div className="ki">🏷</div></div>
            <div className="kc gn"><div className="kl">On Budget (&lt;70%)</div><div className="kv">{filteredBrands.filter(b => pctOf(b.disbursed,b.budget) < 70).length}</div><div className="kd up">No action required</div><div className="ki">✓</div></div>
            <div className="kc yw"><div className="kl">Monitor (70–89%)</div><div className="kv">{filteredBrands.filter(b => { const p=pctOf(b.disbursed,b.budget); return p>=70&&p<90; }).length}</div><div className="kd nt">Watch closely</div><div className="ki">👁</div></div>
            <div className="kc rd"><div className="kl">Alert (≥90%)</div><div className="kv">{filteredBrands.filter(b => pctOf(b.disbursed,b.budget) >= 90).length}</div><div className="kd dn">Exceptions active</div><div className="ki">🚨</div></div>
          </div>
          <div className="tbbar"><div className="tbt">Budget Utilisation — Filtered Brands</div></div>
          <div style={{ background: 'var(--l1)', border: '1px solid var(--bs)', padding: '14px 18px' }}>
            {filteredBrands.map(b => {
              const pct = pctOf(b.disbursed, b.budget);
              const color = pctColor(pct);
              return (
                <div key={b.brand} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: '1px solid var(--bs)', cursor: 'pointer' }} onClick={() => openDetail(b, 'brand-expenditure')}>
                  <div style={{ width: 130, flexShrink: 0 }}><BrandChip brand={b.brand} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 10, background: 'var(--l3)', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: color, transition: 'width 1.2s ease' }} />
                      <div style={{ position: 'absolute', left: '80%', top: 0, height: '100%', width: 1, background: 'var(--wa)', opacity: 0.6 }} />
                      <div style={{ position: 'absolute', left: '90%', top: 0, height: '100%', width: 1, background: 'var(--er)', opacity: 0.6 }} />
                    </div>
                  </div>
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, fontSize: 13, color, width: 40, textAlign: 'right' }}>{pct}%</span>
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--ts)', width: 150, textAlign: 'right' }}>{formatMoneyShort(b.disbursed, currency)} of {formatMoneyShort(b.budget, currency)}</span>
                  <div style={{ width: 60, textAlign: 'right', fontSize: 11, color: 'var(--ts)', fontFamily: "'IBM Plex Mono',monospace" }}>{b.shops} shops</div>
                </div>
              );
            })}
            <div style={{ marginTop: 8, fontSize: 10, color: 'var(--ts)', fontFamily: "'IBM Plex Mono',monospace", display: 'flex', gap: 16 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 2, background: 'var(--wa)', display: 'inline-block' }}></span>80% monitor threshold</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 2, background: 'var(--er)', display: 'inline-block' }}></span>90% exception threshold</span>
            </div>
          </div>
        </>)}

        {/* ── Tab 2: Petty Cash Expenses ────────────────────────────────── */}
        {tab === 2 && (<>
          <div className="kg c4">
            <div className="kc bl"><div className="kl">Total Expenses</div><div className="kv">{filteredExpenses.length}</div><div className="kd nt">Filtered results</div><div className="ki">💳</div></div>
            <div className="kc gn"><div className="kl">Total Value</div><div className="kv">{formatMoneyShort(filteredExpenses.reduce((s,e) => s+e.amt, 0), currency)}</div><div className="kd nt">Sum of all expenses</div><div className="ki">📊</div></div>
            <div className="kc yw"><div className="kl">Pending</div><div className="kv">{filteredExpenses.filter(e => ['review','over'].includes(e.status)).length}</div><div className="kd nt">Awaiting action</div><div className="ki">⏳</div></div>
            <div className="kc rd"><div className="kl">Exceptions</div><div className="kv">{filteredExpenses.filter(e => e.status === 'over').length}</div><div className="kd dn">Over budget</div><div className="ki">🚨</div></div>
          </div>

          {catFilter ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <button className="ab" style={{ height: 28, fontSize: 11, padding: '0 10px' }} onClick={() => setCatFilter(null)}>← All Categories</button>
                <span style={{ fontSize: 12, color: 'var(--ts)' }}>Drilling into:</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--int)', background: 'var(--info-bg)', padding: '2px 10px', border: '1px solid var(--int)' }}>{catFilter}</span>
              </div>
              <div className="tbbar"><div className="tbt">{catFilter} — Store-level Breakdown</div></div>
              <DataTable
                columns={[
                  { label: 'ID', key: 'id' },
                  { label: 'Date', key: 'date' },
                  { label: 'Brand', key: 'brand' },
                  { label: 'Shop', key: 'shop' },
                  { label: 'Location', key: 'location' },
                  { label: 'Supplier', key: 'supplier' },
                  { label: 'Amount', key: 'amt', barKey: 'amtRaw' },
                  { label: 'Status', key: 'status' },
                ]}
                data={filteredExpenses.filter(e => e.cat === catFilter).map(e => ({
                  ...e,
                  id: <code style={{ color: 'var(--info)', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11 }}>{e.id}</code>,
                  date: <span style={{ fontSize: 12, color: 'var(--ts)' }}>{e.date}</span>,
                  brand: <BrandChip brand={e.brand} />,
                  shop: <span style={{ fontSize: 12, fontWeight: 600 }}>{e.shop}</span>,
                  location: <span style={{ fontSize: 11, color: 'var(--ts)' }}>{e.location}</span>,
                  amtRaw: e.amt,
                  amt: <strong>{formatMoney(e.amt, currency)}</strong>,
                  status: <StatusTag type={e.status} />,
                }))}
                onRowClick={(row) => openDetail(row, 'expense')}
              />
            </>
          ) : (
            <>
              <div className="tbbar"><div className="tbt">Petty Cash Expenses — Click a Category to drill down to store level</div></div>
              <DataTable
                columns={[
                  { label: 'ID', key: 'id' },
                  { label: 'Date', key: 'date' },
                  { label: 'Brand', key: 'brand' },
                  { label: 'Shop', key: 'shop' },
                  { label: 'Category', key: 'cat' },
                  { label: 'Supplier', key: 'supplier' },
                  { label: 'Amount', key: 'amt', barKey: 'amtRaw' },
                  { label: 'Status', key: 'status' },
                ]}
                data={filteredExpenses.map(e => ({
                  ...e,
                  id: <code style={{ color: 'var(--info)', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11 }}>{e.id}</code>,
                  date: <span style={{ fontSize: 12, color: 'var(--ts)' }}>{e.date}</span>,
                  brand: <BrandChip brand={e.brand} />,
                  shop: <span style={{ fontSize: 12 }}>{e.shop}</span>,
                  cat: (
                    <span
                      style={{ fontSize: 11, fontWeight: 600, color: 'var(--int)', background: 'var(--info-bg)', padding: '2px 8px', border: '1px solid var(--int)', cursor: 'pointer' }}
                      onClick={ev => { ev.stopPropagation(); setCatFilter(e.cat); }}
                    >{e.cat}</span>
                  ),
                  amtRaw: e.amt,
                  amt: <strong>{formatMoney(e.amt, currency)}</strong>,
                  status: <StatusTag type={e.status} />,
                }))}
                onRowClick={(row) => openDetail(row, 'expense')}
              />
            </>
          )}
        </>)}

        {/* ── Tab 3: InnBucks Sales ─────────────────────────────────────── */}
        {tab === 3 && (<>
          <div className="kg c4">
            <div className="kc gn"><div className="kl">Total Sales Today</div><div className="kv">{formatMoneyShort(totalSales, currency)}</div><div className="kd up">↑ 4.2% vs yesterday</div><div className="ki">📈</div></div>
            <div className="kc bl"><div className="kl">Total Transactions</div><div className="kv">{totalTxns}</div><div className="kd up">Settled today</div><div className="ki">✓</div></div>
            <div className="kc yw"><div className="kl">Avg Basket Size</div><div className="kv">{totalTxns > 0 ? formatMoney(totalSales/totalTxns, currency) : formatMoney(0, currency)}</div><div className="kd nt">Per transaction</div><div className="ki">💳</div></div>
            <div className="kc rd"><div className="kl">Brands Not Live</div><div className="kv">{filteredInnBucks.filter(b=>b.notLive).length}</div><div className="kd dn">Pending InnBucks setup</div><div className="ki">⚠</div></div>
          </div>
          <div className="tbbar"><div className="tbt">InnBucks Sales — Filtered Brands</div></div>
          <DataTable
            columns={[
              { label: 'Brand', key: 'brand' },
              { label: 'Shop', key: 'shop' },
              { label: 'Today Sales', key: 'sales', barKey: 'salesRaw' },
              { label: 'Transactions', key: 'txns' },
              { label: 'Avg Basket', key: 'avg' },
              { label: 'vs Yesterday', key: 'trend' },
              { label: 'Status', key: 'statusTag' },
            ]}
            data={filteredInnBucks.map(b => ({
              ...b,
              brand: <BrandChip brand={b.brand} />,
              shop: <span style={{ fontSize: 12, color: 'var(--ts)' }}>{b.shop}</span>,
              salesRaw: b.sales || 0,
              sales: b.notLive ? <strong>—</strong> : <strong>{formatMoneyShort(b.sales, currency)}</strong>,
              txns: b.notLive ? 'Not live' : b.txns,
              avg: b.avg ? formatMoney(b.avg, currency) : '—',
              trend: <span style={{ color: trendColor(b.trend), fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{trendLabel(b.trend)}</span>,
              statusTag: b.notLive ? <StatusTag type="pending" label="NOT LIVE" /> : <StatusTag type="settled" label="LIVE" />,
            }))}
            onRowClick={(row) => !row.notLive && openDetail(row, 'innbucks')}
          />
        </>)}

        {/* ── Tab 4: Supplier Analytics ────────────────────────────────────── */}
        {tab === 4 && (<>
          <div className="kg c4">
            <div className="kc bl"><div className="kl">Group Supplier Spend (MTD)</div><div className="kv">{formatMoneyShort(filteredSuppliers.reduce((s,t) => s+t.mtd,0), currency)}</div><div className="kd up">↑ 8% vs last month</div><div className="ki">💳</div></div>
            <div className="kc gn"><div className="kl">Group Supplier Spend (YTD)</div><div className="kv">{formatMoneyShort(filteredSuppliers.reduce((s,t) => s+t.ytd,0), currency)}</div><div className="kd nt">Across filtered brands</div><div className="ki">📊</div></div>
            <div className="kc yw"><div className="kl">Active Suppliers</div><div className="kv">{filteredSuppliers.length}</div><div className="kd nt">Matching filters</div><div className="ki">✓</div></div>
            <div className="kc rd"><div className="kl">Cert. Alerts</div><div className="kv">3</div><div className="kd dn">Expiring within 3 months</div><div className="ki">⚠</div></div>
          </div>
          <div className="tbbar"><div className="tbt">Supplier Analytics — Filtered</div></div>
          <DataTable
            columns={[
              { label: 'Supplier', key: 'name' },
              { label: 'Shop', key: 'shop' },
              { label: 'MTD Spend', key: 'mtd', barKey: 'mtdRaw' },
              { label: 'YTD Spend', key: 'ytd' },
              { label: 'Brands', key: 'brands' },
              { label: 'MTD vs Last Month', key: 'trend' },
            ]}
            data={filteredSuppliers.map(s => ({
              ...s,
              name: <strong>{s.name}</strong>,
              shop: <span style={{ fontSize: 12, color: 'var(--ts)' }}>{s.shop}</span>,
              mtdRaw: s.mtd,
              mtd: <strong>{formatMoneyShort(s.mtd, currency)}</strong>,
              ytd: <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{formatMoneyShort(s.ytd, currency)}</span>,
              trend: <span style={{ color: trendColor(s.trend), fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{trendLabel(s.trend)}</span>,
            }))}
            onRowClick={(row) => openDetail(row, 'supplier')}
          />
        </>)}

        {/* ── Tab 5: Custom Reports ─────────────────────────────────────── */}
        {tab === 5 && (<>
          <div style={{ marginBottom: 18 }}>
            <div className="tbbar" style={{ marginBottom: 10 }}><div className="tbt">Report Builder — Select metrics and grouping</div></div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
              {REPORT_METRICS.map(m => (
                <button
                  key={m.id}
                  className={`ab${reportMetrics.includes(m.id) ? ' pri' : ''}`}
                  style={{ height: 34, fontSize: 12, gap: 6, display: 'flex', alignItems: 'center' }}
                  onClick={() => toggleMetric(m.id)}
                >
                  <span>{m.icon}</span> {m.label}
                </button>
              ))}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--ts)' }}>Group by:</span>
                {['brand', 'location', 'shop'].map(g => (
                  <button
                    key={g}
                    className={`ab${reportGroupBy === g ? ' pri' : ''}`}
                    style={{ height: 28, fontSize: 11, textTransform: 'capitalize' }}
                    onClick={() => setReportGroupBy(g)}
                  >{g}</button>
                ))}
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--ts)', marginBottom: 4 }}>
              Filters above apply · Showing: {reportMetrics.length === 0 ? 'no metrics selected' : reportMetrics.map(id => REPORT_METRICS.find(m => m.id === id)?.label).join(', ')} · Grouped by {reportGroupBy}
            </div>
          </div>

          {reportMetrics.length === 0 && (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--ts)', fontSize: 13 }}>
              Select at least one metric above to build your report.
            </div>
          )}

          {reportMetrics.includes('budget') && (
            <div style={{ marginBottom: 20 }}>
              <div className="tbbar"><div className="tbt">📊 Budget Utilisation — {reportGroupBy === 'shop' ? 'by Shop' : reportGroupBy === 'location' ? 'by Location' : 'by Brand'}</div></div>
              <DataTable
                columns={[
                  { label: reportGroupBy === 'shop' ? 'Shop' : reportGroupBy === 'location' ? 'Location' : 'Brand', key: 'group' },
                  { label: 'Budget', key: 'budget' },
                  { label: 'Disbursed', key: 'disbursed' },
                  { label: '% Used', key: 'pct' },
                ]}
                data={(() => {
                  if (reportGroupBy === 'brand') return filteredBrands.map(b => ({
                    group: <BrandChip brand={b.brand} />,
                    budget: formatMoneyShort(b.budget, currency),
                    disbursed: formatMoneyShort(b.disbursed, currency),
                    pct: <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600, color: pctColor(pctOf(b.disbursed, b.budget)) }}>{pctOf(b.disbursed, b.budget)}%</span>,
                  }));
                  if (reportGroupBy === 'location') {
                    const locs = [...new Set(filteredBrands.map(b => b.location))];
                    return locs.map(loc => {
                      const rows = filteredBrands.filter(b => b.location === loc);
                      const bud = rows.reduce((s,b) => s+b.budget, 0);
                      const dis = rows.reduce((s,b) => s+b.disbursed, 0);
                      return { group: loc, budget: formatMoneyShort(bud, currency), disbursed: formatMoneyShort(dis, currency), pct: <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600, color: pctColor(pctOf(dis, bud)) }}>{pctOf(dis, bud)}%</span> };
                    });
                  }
                  return filteredBrands.map(b => ({
                    group: <span style={{ fontSize: 12 }}>{b.shop}</span>,
                    budget: formatMoneyShort(b.budget, currency),
                    disbursed: formatMoneyShort(b.disbursed, currency),
                    pct: <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600, color: pctColor(pctOf(b.disbursed, b.budget)) }}>{pctOf(b.disbursed, b.budget)}%</span>,
                  }));
                })()}
              />
            </div>
          )}

          {reportMetrics.includes('petty-cash') && (
            <div style={{ marginBottom: 20 }}>
              <div className="tbbar"><div className="tbt">💳 Petty Cash Expenses — {reportGroupBy === 'shop' ? 'by Shop' : reportGroupBy === 'location' ? 'by Location' : 'by Brand'}</div></div>
              <DataTable
                columns={[
                  { label: reportGroupBy === 'shop' ? 'Shop' : reportGroupBy === 'location' ? 'Location' : 'Brand', key: 'group' },
                  { label: 'Expenses', key: 'count' },
                  { label: 'Total Value', key: 'total', barKey: 'totalRaw' },
                  { label: 'Top Category', key: 'topCat' },
                ]}
                data={(() => {
                  const groupKey = reportGroupBy === 'shop' ? 'shop' : reportGroupBy === 'location' ? 'location' : 'brand';
                  const groups = [...new Set(filteredExpenses.map(e => e[groupKey]))];
                  return groups.map(g => {
                    const rows = filteredExpenses.filter(e => e[groupKey] === g);
                    const total = rows.reduce((s,e) => s+e.amt, 0);
                    const cats = rows.reduce((m,e) => { m[e.cat] = (m[e.cat]||0)+1; return m; }, {});
                    const topCat = Object.entries(cats).sort((a,b) => b[1]-a[1])[0]?.[0] || '—';
                    return {
                      group: groupKey === 'brand' ? <BrandChip brand={g} /> : <span style={{ fontSize: 12 }}>{g}</span>,
                      count: rows.length,
                      totalRaw: total,
                      total: <strong>{formatMoneyShort(total, currency)}</strong>,
                      topCat: <span style={{ fontSize: 11, color: 'var(--int)', background: 'var(--info-bg)', padding: '2px 8px', border: '1px solid var(--int)' }}>{topCat}</span>,
                    };
                  });
                })()}
              />
            </div>
          )}

          {reportMetrics.includes('innbucks') && (
            <div style={{ marginBottom: 20 }}>
              <div className="tbbar"><div className="tbt">📈 InnBucks Sales — {reportGroupBy === 'shop' ? 'by Shop' : reportGroupBy === 'location' ? 'by Location' : 'by Brand'}</div></div>
              <DataTable
                columns={[
                  { label: reportGroupBy === 'shop' ? 'Shop' : reportGroupBy === 'location' ? 'Location' : 'Brand', key: 'group' },
                  { label: 'Sales', key: 'sales', barKey: 'salesRaw' },
                  { label: 'Transactions', key: 'txns' },
                  { label: 'Avg Basket', key: 'avg' },
                  { label: 'vs Yesterday', key: 'trend' },
                ]}
                data={(() => {
                  const groupKey = reportGroupBy === 'shop' ? 'shop' : reportGroupBy === 'location' ? 'location' : 'brand';
                  const groups = [...new Set(filteredInnBucks.filter(b => !b.notLive).map(b => b[groupKey]))];
                  return groups.map(g => {
                    const rows = filteredInnBucks.filter(b => !b.notLive && b[groupKey] === g);
                    const sales = rows.reduce((s,b) => s+b.sales, 0);
                    const txns = rows.reduce((s,b) => s+b.txns, 0);
                    const avg = txns > 0 ? sales/txns : 0;
                    const trend = rows.length === 1 ? rows[0].trend : null;
                    return {
                      group: groupKey === 'brand' ? <BrandChip brand={g} /> : <span style={{ fontSize: 12 }}>{g}</span>,
                      salesRaw: sales,
                      sales: <strong>{formatMoneyShort(sales, currency)}</strong>,
                      txns,
                      avg: formatMoney(avg, currency),
                      trend: <span style={{ color: trendColor(trend), fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{trendLabel(trend)}</span>,
                    };
                  });
                })()}
              />
            </div>
          )}

          {reportMetrics.includes('suppliers') && (
            <div style={{ marginBottom: 20 }}>
              <div className="tbbar"><div className="tbt">🏭 Supplier Spend — {reportGroupBy === 'shop' ? 'by Shop' : reportGroupBy === 'location' ? 'by Location' : 'by Brand'}</div></div>
              <DataTable
                columns={[
                  { label: 'Supplier', key: 'name' },
                  { label: 'MTD Spend', key: 'mtd', barKey: 'mtdRaw' },
                  { label: 'YTD Spend', key: 'ytd' },
                  { label: 'Brands', key: 'brands' },
                  { label: 'MTD Trend', key: 'trend' },
                ]}
                data={filteredSuppliers.map(s => ({
                  name: <strong>{s.name}</strong>,
                  mtdRaw: s.mtd,
                  mtd: <strong>{formatMoneyShort(s.mtd, currency)}</strong>,
                  ytd: <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{formatMoneyShort(s.ytd, currency)}</span>,
                  brands: s.brands,
                  trend: <span style={{ color: trendColor(s.trend), fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{trendLabel(s.trend)}</span>,
                }))}
              />
            </div>
          )}
        </>)}
      </div>

      {/* ── Detail Modals ──────────────────────────────────────────────── */}
      {detailItem && detailType === 'expense' && (
        <CvsModal open={!!detailItem} onClose={() => setDetailItem(null)} title={`Expense Detail — ${detailItem.id}`} subtitle={`${detailItem.cat} · ${detailItem.supplier}`}
          footer={<button className="ab pri lg" onClick={() => setDetailItem(null)}>Close</button>}>
          <div style={{ padding: 10, background: 'var(--info-bg)', borderLeft: '3px solid var(--int)', marginBottom: 13 }}>
            <div style={{ fontSize: 11, color: 'var(--info)', fontWeight: 600 }}>Origin</div>
            <div style={{ fontSize: 12, color: 'var(--ts)', marginTop: 2 }}>{detailItem.brand} · {detailItem.shop} · {detailItem.location}</div>
          </div>
          {[
            { label: 'Request ID', value: <code style={{ color: 'var(--info)', fontFamily: "'IBM Plex Mono',monospace" }}>{detailItem.id}</code> },
            { label: 'Date', value: detailItem.date },
            { label: 'Brand', value: detailItem.brand },
            { label: 'Shop', value: detailItem.shop },
            { label: 'Location', value: detailItem.location },
            { label: 'Category', value: detailItem.cat },
            { label: 'Supplier', value: detailItem.supplier },
            { label: 'Manager', value: detailItem.mgr },
            { label: 'Amount', value: <span style={{ fontWeight: 700, color: 'var(--int)', fontSize: 18, fontFamily: "'IBM Plex Sans Condensed',sans-serif" }}>{formatMoney(detailItem.amt, currency)}</span> },
            { label: 'Status', value: <StatusTag type={detailItem.status} /> },
            ...(detailItem.wallet ? [{ label: 'InnBucks Wallet', value: <code style={{ fontFamily: "'IBM Plex Mono',monospace" }}>{detailItem.wallet}</code> }] : []),
            ...(detailItem.txn ? [{ label: 'Transaction Ref', value: <code style={{ color: 'var(--ok-t)', fontFamily: "'IBM Plex Mono',monospace" }}>{detailItem.txn}</code> }] : []),
          ].map((row, i, arr) => (
            <div key={i} className="cvs-detail-row" style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--bs)' : 'none' }}>
              <span className="cvs-detail-label">{row.label}</span>
              <span>{row.value}</span>
            </div>
          ))}
        </CvsModal>
      )}

      {detailItem && detailType === 'brand-expenditure' && (
        <CvsModal open={!!detailItem} onClose={() => setDetailItem(null)} title={`Brand Detail — ${detailItem.brand}`} subtitle={`${detailItem.shop} · ${detailItem.location}`}
          footer={<button className="ab pri lg" onClick={() => setDetailItem(null)}>Close</button>}>
          <div style={{ padding: 10, background: 'var(--info-bg)', borderLeft: '3px solid var(--int)', marginBottom: 13 }}>
            <div style={{ fontSize: 11, color: 'var(--info)', fontWeight: 600 }}>Origin</div>
            <div style={{ fontSize: 12, color: 'var(--ts)', marginTop: 2 }}>{detailItem.brand} · {detailItem.shop} · {detailItem.location}</div>
          </div>
          {[
            { label: 'Brand', value: <BrandChip brand={detailItem.brand} /> },
            { label: 'Shop', value: detailItem.shop },
            { label: 'Location', value: detailItem.location },
            { label: 'Monthly Budget', value: <span style={{ fontWeight: 700, color: 'var(--int)', fontSize: 16 }}>{formatMoneyShort(detailItem.budget, currency)}</span> },
            { label: 'Disbursed', value: <span style={{ fontWeight: 600 }}>{formatMoneyShort(detailItem.disbursed, currency)}</span> },
            { label: 'Remaining', value: formatMoneyShort(detailItem.budget - detailItem.disbursed, currency) },
            { label: '% Used', value: <span style={{ fontWeight: 700, color: pctColor(pctOf(detailItem.disbursed, detailItem.budget)) }}>{pctOf(detailItem.disbursed, detailItem.budget)}%</span> },
            { label: 'Total Shops', value: detailItem.shops },
          ].map((row, i, arr) => (
            <div key={i} className="cvs-detail-row" style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--bs)' : 'none' }}>
              <span className="cvs-detail-label">{row.label}</span>
              <span>{row.value}</span>
            </div>
          ))}
        </CvsModal>
      )}

      {detailItem && detailType === 'innbucks' && (
        <CvsModal open={!!detailItem} onClose={() => setDetailItem(null)} title={`InnBucks Detail — ${detailItem.brand}`} subtitle={`${detailItem.shop} · ${detailItem.location}`}
          footer={<button className="ab pri lg" onClick={() => setDetailItem(null)}>Close</button>}>
          <div style={{ padding: 10, background: 'var(--info-bg)', borderLeft: '3px solid var(--int)', marginBottom: 13 }}>
            <div style={{ fontSize: 11, color: 'var(--info)', fontWeight: 600 }}>Origin</div>
            <div style={{ fontSize: 12, color: 'var(--ts)', marginTop: 2 }}>{detailItem.brand} · {detailItem.shop} · {detailItem.location}</div>
          </div>
          {[
            { label: 'Brand', value: <BrandChip brand={detailItem.brand} /> },
            { label: 'Shop', value: detailItem.shop },
            { label: 'Location', value: detailItem.location },
            { label: 'Today Sales', value: <span style={{ fontWeight: 700, color: 'var(--int)', fontSize: 18 }}>{formatMoneyShort(detailItem.sales, currency)}</span> },
            { label: 'Transactions', value: detailItem.txns },
            { label: 'Avg Basket', value: detailItem.avg ? formatMoney(detailItem.avg, currency) : '—' },
            { label: 'vs Yesterday', value: <span style={{ color: trendColor(detailItem.trend) }}>{trendLabel(detailItem.trend)}</span> },
            { label: 'Status', value: detailItem.notLive ? <StatusTag type="pending" label="NOT LIVE" /> : <StatusTag type="settled" label="LIVE" /> },
          ].map((row, i, arr) => (
            <div key={i} className="cvs-detail-row" style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--bs)' : 'none' }}>
              <span className="cvs-detail-label">{row.label}</span>
              <span>{row.value}</span>
            </div>
          ))}
        </CvsModal>
      )}

      {detailItem && detailType === 'supplier' && (
        <CvsModal open={!!detailItem} onClose={() => setDetailItem(null)} title={`Supplier Detail — ${detailItem.name}`} subtitle={`${detailItem.brands} · ${detailItem.location}`}
          footer={<button className="ab pri lg" onClick={() => setDetailItem(null)}>Close</button>}>
          <div style={{ padding: 10, background: 'var(--info-bg)', borderLeft: '3px solid var(--int)', marginBottom: 13 }}>
            <div style={{ fontSize: 11, color: 'var(--info)', fontWeight: 600 }}>Origin</div>
            <div style={{ fontSize: 12, color: 'var(--ts)', marginTop: 2 }}>{detailItem.name} · {detailItem.shop} · {detailItem.location}</div>
          </div>
          {[
            { label: 'Supplier', value: <strong>{detailItem.name}</strong> },
            { label: 'Shop', value: detailItem.shop },
            { label: 'Location', value: detailItem.location },
            { label: 'Brands Served', value: detailItem.brands },
            { label: 'MTD Spend', value: <span style={{ fontWeight: 700, color: 'var(--int)', fontSize: 16 }}>{formatMoneyShort(detailItem.mtd, currency)}</span> },
            { label: 'YTD Spend', value: <span style={{ fontWeight: 600 }}>{formatMoneyShort(detailItem.ytd, currency)}</span> },
            { label: 'MTD vs Last Month', value: <span style={{ color: trendColor(detailItem.trend) }}>{trendLabel(detailItem.trend)}</span> },
          ].map((row, i, arr) => (
            <div key={i} className="cvs-detail-row" style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--bs)' : 'none' }}>
              <span className="cvs-detail-label">{row.label}</span>
              <span>{row.value}</span>
            </div>
          ))}
        </CvsModal>
      )}
    </>
  );
}
