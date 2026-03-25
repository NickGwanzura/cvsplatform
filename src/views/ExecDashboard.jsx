import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import BrandChip from '../components/shared/BrandChip';
import StatusTag from '../components/shared/StatusTag';

const BRANDS_DATA = [
  { brand: 'Chicken Inn',  budget: 8000,  disbursed: 4880, shops: 14, alerts: 1, alertType: 'monitor' },
  { brand: 'Pizza Inn',    budget: 7200,  disbursed: 5328, shops: 12, alerts: 2, alertType: 'alert' },
  { brand: 'Creamy Inn',   budget: 4000,  disbursed: 1920, shops: 8,  alerts: 0 },
  { brand: "Nando's",      budget: 3200,  disbursed: 2624, shops: 6,  alerts: 1, alertType: 'alert' },
  { brand: 'Steers',       budget: 2400,  disbursed: 1320, shops: 5,  alerts: 0 },
  { brand: "Roco Mamma's", budget: 2000,  disbursed: 1380, shops: 4,  alerts: 0 },
  { brand: 'Ocean Basket', budget: 1600,  disbursed: 688,  shops: 3,  alerts: 0 },
  { brand: 'Hefelies',     budget: 1200,  disbursed: 444,  shops: 2,  alerts: 0 },
  { brand: "Pastino's",    budget: 1400,  disbursed: 812,  shops: 3,  alerts: 0 },
];

const INNBUCKS_DATA = [
  { brand: 'Chicken Inn',  sales: 8420,  txns: 98, avg: 85.92,  trend: 6 },
  { brand: 'Pizza Inn',    sales: 6910,  txns: 74, avg: 93.38,  trend: 2 },
  { brand: 'Creamy Inn',   sales: 3840,  txns: 52, avg: 73.85,  trend: -4 },
  { brand: "Nando's",      sales: 2890,  txns: 31, avg: 93.23,  trend: 11 },
  { brand: 'Steers',       sales: 2120,  txns: 29, avg: 73.10,  trend: 0 },
  { brand: "Roco Mamma's", sales: null,  txns: null, avg: null, trend: null, notLive: true },
];

const SUPPLIER_TRENDS = [
  { name: 'Swift Maintenance', mtd: 3120, ytd: 18920, brands: 'PI, ST, CI', trend: 5 },
  { name: 'CleanPro Supplies', mtd: 2340, ytd: 14100, brands: 'CI, PI, ND', trend: 12 },
  { name: 'ZimGas Ltd',        mtd: 1870, ytd: 11220, brands: 'CI, CR, ND', trend: -3 },
  { name: 'OvenPro',           mtd: 1200, ytd: 7200,  brands: 'PI',          trend: 22 },
  { name: 'AquaFix',           mtd: 890,  ytd: 5340,  brands: 'CI',          trend: 0 },
];

const pctOf = (a, b) => Math.round((a / b) * 100);
const pctColor = (p) => p >= 90 ? 'var(--er)' : p >= 70 ? 'var(--wa-t)' : 'var(--ok-t)';
const trendColor = (t) => t > 0 ? 'var(--ok)' : t < 0 ? 'var(--er)' : 'var(--ts)';
const trendLabel = (t) => t === null ? '—' : t === 0 ? '0%' : `${t > 0 ? '↑' : '↓'} ${Math.abs(t)}%`;

const totalBudget = BRANDS_DATA.reduce((s, b) => s + b.budget, 0);
const totalDisbursed = BRANDS_DATA.reduce((s, b) => s + b.disbursed, 0);
const totalSales = INNBUCKS_DATA.filter(b => !b.notLive).reduce((s, b) => s + b.sales, 0);
const totalTxns = INNBUCKS_DATA.filter(b => !b.notLive).reduce((s, b) => s + b.txns, 0);

export default function ExecDashboard() {
  const { activeTab } = useApp();
  const [tab, setTab] = useState(activeTab ?? 0);
  useEffect(() => { setTab(activeTab ?? 0); }, [activeTab]);
  const tabs = ['Group Overview', 'Brand Breakdown', 'InnBucks Sales', 'Supplier Trends'];

  return (
    <>
      <div className="ph">
        <div className="bc">CVS <span>/</span> Executive <span>/</span> Overview</div>
        <div className="pt">Executive Dashboard — Simbisa Group</div>
        <div className="pd">Group-wide petty cash, InnBucks sales and supplier intelligence · March 2025</div>
        <div className="ptabs">
          {tabs.map((t, i) => (
            <button key={t} className={`ptab${tab === i ? ' on' : ''}`} onClick={() => setTab(i)}>{t}</button>
          ))}
        </div>
      </div>
      <div className="cnt">

        {/* ── Tab 0: Group Overview ─────────────────────────────────────── */}
        {tab === 0 && (<>
          <div className="kg c4">
            <div className="kc bl"><div className="kl">Total Petty Cash Disbursed (MTD)</div><div className="kv">${totalDisbursed.toLocaleString()}</div><div className="kd up">↑ 8% vs February</div><div className="ki">💳</div></div>
            <div className="kc gn"><div className="kl">InnBucks Sales — All Brands</div><div className="kv">${totalSales.toLocaleString()}</div><div className="kd up">↑ Today's total</div><div className="ki">📈</div></div>
            <div className="kc yw"><div className="kl">Total Budget (MTD)</div><div className="kv">${totalBudget.toLocaleString()}</div><div className="kd nt">{pctOf(totalDisbursed, totalBudget)}% utilised</div><div className="ki">📊</div></div>
            <div className="kc rd"><div className="kl">Threshold Alerts</div><div className="kv">{BRANDS_DATA.reduce((s,b) => s+b.alerts,0)}</div><div className="kd dn">Shops over 80% limit</div><div className="ki">🚨</div></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <div className="tbbar"><div className="tbt">Expenditure — All Brands (MTD)</div></div>
              <table className="dt">
                <thead><tr><th>Brand</th><th>Budget</th><th>Disbursed</th><th>Remaining</th><th>% Used</th><th>Alerts</th></tr></thead>
                <tbody>
                  {BRANDS_DATA.map(b => {
                    const pct = pctOf(b.disbursed, b.budget);
                    return (
                      <tr key={b.brand}>
                        <td><BrandChip brand={b.brand} /></td>
                        <td>${b.budget.toLocaleString()}</td>
                        <td>${b.disbursed.toLocaleString()}</td>
                        <td>${(b.budget - b.disbursed).toLocaleString()}</td>
                        <td><span style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600, color: pctColor(pct) }}>{pct}%</span></td>
                        <td>
                          {b.alerts > 0
                            ? <StatusTag type={b.alertType} label={String(b.alerts)} />
                            : <span style={{ color: 'var(--ts)', fontSize: 12 }}>—</span>
                          }
                        </td>
                      </tr>
                    );
                  })}
                  <tr style={{ background: 'var(--l2)' }}>
                    <td><strong>TOTAL</strong></td>
                    <td><strong>${totalBudget.toLocaleString()}</strong></td>
                    <td><strong>${totalDisbursed.toLocaleString()}</strong></td>
                    <td><strong>${(totalBudget - totalDisbursed).toLocaleString()}</strong></td>
                    <td><span style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, color: pctColor(pctOf(totalDisbursed, totalBudget)) }}>{pctOf(totalDisbursed, totalBudget)}%</span></td>
                    <td><StatusTag type="alert" label={String(BRANDS_DATA.reduce((s,b) => s+b.alerts,0))} /></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <div className="tbbar">
                <div className="tbt">InnBucks Sales — All Brands Today</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ok)', animation: 'blink 1.5s infinite' }} />
                  <span style={{ fontSize: 10, color: 'var(--ok-t)', fontFamily: "'IBM Plex Mono',monospace" }}>LIVE</span>
                </div>
              </div>
              <table className="dt">
                <thead><tr><th>Brand</th><th>Today Sales</th><th>Transactions</th><th>Avg Basket</th><th>vs Yesterday</th></tr></thead>
                <tbody>
                  {INNBUCKS_DATA.map(b => (
                    <tr key={b.brand}>
                      <td><BrandChip brand={b.brand} /></td>
                      <td>{b.notLive ? <strong>—</strong> : <strong>${b.sales.toLocaleString()}</strong>}</td>
                      <td style={{ color: b.notLive ? 'var(--ts)' : 'inherit', fontSize: b.notLive ? 12 : 13 }}>{b.notLive ? 'Not live' : b.txns}</td>
                      <td>{b.avg ? `$${b.avg.toFixed(2)}` : '—'}</td>
                      <td style={{ color: trendColor(b.trend), fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{trendLabel(b.trend)}</td>
                    </tr>
                  ))}
                  <tr style={{ background: 'var(--l2)' }}>
                    <td><strong>TOTAL</strong></td>
                    <td><strong>${totalSales.toLocaleString()}</strong></td>
                    <td><strong>{totalTxns}</strong></td>
                    <td><strong>${(totalSales / totalTxns).toFixed(2)}</strong></td>
                    <td style={{ color: 'var(--ok)', fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>↑ 4.2%</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ height: 16 }} />
              <div className="tbbar"><div className="tbt">Supplier Trends — Group Level</div></div>
              <table className="dt">
                <thead><tr><th>Supplier</th><th>MTD Spend</th><th>YTD Spend</th><th>Brands</th><th>Trend</th></tr></thead>
                <tbody>
                  {SUPPLIER_TRENDS.slice(0,3).map(s => (
                    <tr key={s.name}>
                      <td><strong>{s.name}</strong></td>
                      <td><strong>${s.mtd.toLocaleString()}</strong></td>
                      <td style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>${s.ytd.toLocaleString()}</td>
                      <td style={{ fontSize: 11, color: 'var(--ts)' }}>{s.brands}</td>
                      <td style={{ color: trendColor(s.trend), fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{trendLabel(s.trend)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>)}

        {/* ── Tab 1: Brand Breakdown ────────────────────────────────────── */}
        {tab === 1 && (<>
          <div className="kg c4">
            <div className="kc bl"><div className="kl">Brands on Platform</div><div className="kv">{BRANDS_DATA.length}</div><div className="kd nt">All reporting</div><div className="ki">🏷</div></div>
            <div className="kc gn"><div className="kl">On Budget (&lt;70%)</div><div className="kv">{BRANDS_DATA.filter(b => pctOf(b.disbursed,b.budget) < 70).length}</div><div className="kd up">No action required</div><div className="ki">✓</div></div>
            <div className="kc yw"><div className="kl">Monitor (70–89%)</div><div className="kv">{BRANDS_DATA.filter(b => { const p=pctOf(b.disbursed,b.budget); return p>=70&&p<90; }).length}</div><div className="kd nt">Watch closely</div><div className="ki">👁</div></div>
            <div className="kc rd"><div className="kl">Alert (≥90%)</div><div className="kv">{BRANDS_DATA.filter(b => pctOf(b.disbursed,b.budget) >= 90).length}</div><div className="kd dn">Exceptions active</div><div className="ki">🚨</div></div>
          </div>
          <div className="tbbar"><div className="tbt">Budget Utilisation — All Brands</div></div>
          <div style={{ background: 'var(--l1)', border: '1px solid var(--bs)', padding: '14px 18px' }}>
            {BRANDS_DATA.map(b => {
              const pct = pctOf(b.disbursed, b.budget);
              const color = pctColor(pct);
              return (
                <div key={b.brand} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: '1px solid var(--bs)' }}>
                  <div style={{ width: 130, flexShrink: 0 }}><BrandChip brand={b.brand} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 10, background: 'var(--l3)', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: color, transition: 'width 1.2s ease' }} />
                      <div style={{ position: 'absolute', left: '80%', top: 0, height: '100%', width: 1, background: 'var(--wa)', opacity: 0.6 }} />
                      <div style={{ position: 'absolute', left: '90%', top: 0, height: '100%', width: 1, background: 'var(--er)', opacity: 0.6 }} />
                    </div>
                  </div>
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, fontSize: 13, color, width: 40, textAlign: 'right' }}>{pct}%</span>
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--ts)', width: 150, textAlign: 'right' }}>${b.disbursed.toLocaleString()} of ${b.budget.toLocaleString()}</span>
                  <div style={{ width: 60, textAlign: 'right' }}>
                    {b.alerts > 0
                      ? <StatusTag type={b.alertType} label={String(b.alerts)} />
                      : <span style={{ fontSize: 11, color: 'var(--ts)' }}>—</span>
                    }
                  </div>
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

        {/* ── Tab 2: InnBucks Sales ─────────────────────────────────────── */}
        {tab === 2 && (<>
          <div className="kg c4">
            <div className="kc gn"><div className="kl">Total Sales Today</div><div className="kv">${totalSales.toLocaleString()}</div><div className="kd up">↑ 4.2% vs yesterday</div><div className="ki">📈</div></div>
            <div className="kc bl"><div className="kl">Total Transactions</div><div className="kv">{totalTxns}</div><div className="kd up">Settled today</div><div className="ki">✓</div></div>
            <div className="kc yw"><div className="kl">Avg Basket Size</div><div className="kv">${(totalSales/totalTxns).toFixed(2)}</div><div className="kd nt">Per transaction</div><div className="ki">💳</div></div>
            <div className="kc rd"><div className="kl">Brands Not Live</div><div className="kv">{INNBUCKS_DATA.filter(b=>b.notLive).length}</div><div className="kd dn">Pending InnBucks setup</div><div className="ki">⚠</div></div>
          </div>
          <div className="tbbar">
            <div className="tbt">InnBucks Sales — All Brands Today</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ok)', animation: 'blink 1.5s infinite' }} />
              <span style={{ fontSize: 10, color: 'var(--ok-t)', fontFamily: "'IBM Plex Mono',monospace" }}>LIVE</span>
            </div>
          </div>
          <table className="dt">
            <thead><tr><th>Brand</th><th>Today Sales</th><th>% of Group</th><th>Transactions</th><th>Avg Basket</th><th>vs Yesterday</th><th>Status</th></tr></thead>
            <tbody>
              {INNBUCKS_DATA.map(b => (
                <tr key={b.brand}>
                  <td><BrandChip brand={b.brand} /></td>
                  <td>{b.notLive ? <strong>—</strong> : <strong>${b.sales.toLocaleString()}</strong>}</td>
                  <td>
                    {b.notLive
                      ? <span style={{ color: 'var(--ts)', fontSize: 12 }}>—</span>
                      : <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 60, height: 5, background: 'var(--l3)' }}>
                            <div style={{ height: '100%', width: `${Math.round(b.sales/totalSales*100)}%`, background: 'var(--int)' }} />
                          </div>
                          <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono',monospace" }}>{Math.round(b.sales/totalSales*100)}%</span>
                        </div>
                    }
                  </td>
                  <td style={{ color: b.notLive ? 'var(--ts)' : 'inherit', fontSize: b.notLive ? 12 : 13 }}>{b.notLive ? 'Not live' : b.txns}</td>
                  <td>{b.avg ? `$${b.avg.toFixed(2)}` : '—'}</td>
                  <td style={{ color: trendColor(b.trend), fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{trendLabel(b.trend)}</td>
                  <td>{b.notLive ? <StatusTag type="pending" label="NOT LIVE" /> : <StatusTag type="settled" label="LIVE" />}</td>
                </tr>
              ))}
              <tr style={{ background: 'var(--l2)' }}>
                <td><strong>TOTAL</strong></td>
                <td><strong>${totalSales.toLocaleString()}</strong></td>
                <td><span style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700 }}>100%</span></td>
                <td><strong>{totalTxns}</strong></td>
                <td><strong>${(totalSales/totalTxns).toFixed(2)}</strong></td>
                <td style={{ color: 'var(--ok)', fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>↑ 4.2%</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </>)}

        {/* ── Tab 3: Supplier Trends ────────────────────────────────────── */}
        {tab === 3 && (<>
          <div className="kg c4">
            <div className="kc bl"><div className="kl">Group Supplier Spend (MTD)</div><div className="kv">${SUPPLIER_TRENDS.reduce((s,t) => s+t.mtd,0).toLocaleString()}</div><div className="kd up">↑ 8% vs last month</div><div className="ki">💳</div></div>
            <div className="kc gn"><div className="kl">Group Supplier Spend (YTD)</div><div className="kv">${SUPPLIER_TRENDS.reduce((s,t) => s+t.ytd,0).toLocaleString()}</div><div className="kd nt">Across all brands</div><div className="ki">📊</div></div>
            <div className="kc yw"><div className="kl">Active Suppliers</div><div className="kv">16</div><div className="kd nt">Across all brands</div><div className="ki">✓</div></div>
            <div className="kc rd"><div className="kl">Cert. Alerts</div><div className="kv">3</div><div className="kd dn">Expiring within 3 months</div><div className="ki">⚠</div></div>
          </div>
          <div className="tbbar"><div className="tbt">Supplier Trends — Group Level</div></div>
          <table className="dt">
            <thead><tr><th>Supplier</th><th>MTD Spend</th><th>% of MTD</th><th>YTD Spend</th><th>Brands</th><th>MTD vs Last Month</th></tr></thead>
            <tbody>
              {SUPPLIER_TRENDS.map(s => {
                const mtdTotal = SUPPLIER_TRENDS.reduce((sum, t) => sum + t.mtd, 0);
                const pct = Math.round(s.mtd/mtdTotal*100);
                return (
                  <tr key={s.name}>
                    <td><strong>{s.name}</strong></td>
                    <td><strong>${s.mtd.toLocaleString()}</strong></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 80, height: 6, background: 'var(--l3)' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: 'var(--int)' }} />
                        </div>
                        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11 }}>{pct}%</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>${s.ytd.toLocaleString()}</td>
                    <td style={{ fontSize: 11, color: 'var(--ts)' }}>{s.brands}</td>
                    <td style={{ color: trendColor(s.trend), fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{trendLabel(s.trend)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>)}
      </div>
    </>
  );
}
