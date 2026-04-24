import { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatMoney, formatMoneyShort, convert } from '../lib/currency';
import StatusTag from '../components/shared/StatusTag';
import BrandChip from '../components/shared/BrandChip';
import Breadcrumbs from '../components/shared/Breadcrumbs';
import DataTable from '../components/shared/DataTable';
import {
  listSuppliers,
  listProcurementProducts,
  listProcurementCategories,
  approveSupplier,
  reactivateSupplier,
  deleteSupplier,
  deleteProcurementProduct,
} from '../lib/cvsApi';
import {
  NewSupplierModal,
  RejectSupplierModal,
  SuspendSupplierModal,
  ConfirmDeleteModal,
  ProcurementProductModal,
  ManageCategoriesModal,
  SupplierDocumentsModal,
} from '../components/modals/AllModals';

// Mirror of BrandChip's chip class map so supplier brand badges render in-line.
const BRAND_CLS = {
  'Chicken Inn': 'bci', 'Pizza Inn': 'bcp', 'Creamy Inn': 'bcc',
  "Nando's": 'bcn', 'Steers': 'bcs', "Roco Mamma's": 'bcr',
  'Ocean Basket': 'bcob', 'Hefelies': 'bchf', "Pastino's": 'bcpa',
};
const brandTuple = (name) => [name, BRAND_CLS[name] || 'bci'];

// No API yet for per-shop breakdown or supplier statements — empty placeholders.
const BREAKDOWN = [];
const SUPPLIER_STATEMENTS = [];

const trendColor = (t) => t > 0 ? 'var(--ok)' : t < 0 ? 'var(--er)' : 'var(--ts)';
const trendLabel = (t) => t === null ? '—' : t === 0 ? '0%' : `${t > 0 ? '↑' : '↓'} ${Math.abs(t)}%`;

export default function ProcDashboard() {
  const { addToast, activeTab, brandFilter, setBrandFilter, currency } = useApp();
  const hardcodedSpendMTD = 0;
  const hardcodedTopCategorySpend = 0;
  const hardcodedTopSupplierSpend = 0;
  const [tab, setTab] = useState(activeTab ?? 0);
  useEffect(() => { setTab(activeTab ?? 0); }, [activeTab]);
  const [catFilter, setCatFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [analyticsMode, setAnalyticsMode] = useState('product');
  const [supplierProfile, setSupplierProfile] = useState(null);
  const [stmtSearch, setStmtSearch] = useState('');
  const [stmtStatusFilter, setStmtStatusFilter] = useState('All');

  // Server data
  const [suppliersRaw, setSuppliersRaw] = useState([]);
  const [productsRaw, setProductsRaw] = useState([]);
  const [categoriesRaw, setCategoriesRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Modal state
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState(null);
  const [rejectSupplierTarget, setRejectSupplierTarget] = useState(null);
  const [suspendSupplierTarget, setSuspendSupplierTarget] = useState(null);
  const [deleteSupplierTarget, setDeleteSupplierTarget] = useState(null);
  const [docsSupplierTarget, setDocsSupplierTarget] = useState(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteProductTarget, setDeleteProductTarget] = useState(null);
  const [manageCatsOpen, setManageCatsOpen] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [sups, prods, cats] = await Promise.all([
        listSuppliers().catch(() => []),
        listProcurementProducts().catch(() => []),
        listProcurementCategories().catch(() => []),
      ]);
      setSuppliersRaw(Array.isArray(sups) ? sups : []);
      setProductsRaw(Array.isArray(prods) ? prods : []);
      setCategoriesRaw(Array.isArray(cats) ? cats : []);
    } catch (err) {
      setLoadError(err?.response?.data?.message || err.message || 'Failed to load procurement data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const categoryNameById = useMemo(
    () => Object.fromEntries(categoriesRaw.map((c) => [c.id, c.name])),
    [categoriesRaw]
  );

  // Map API supplier → UI shape. MTD/YTD/txns/trend/cert aren't returned by
  // the current API; default to 0/null so summary tiles render without crashing.
  const SUPPLIERS = useMemo(() => suppliersRaw.map((s) => ({
    id: s.id,
    name: s.name || '—',
    code: s.code || '',
    cat: s.scope_type === 'global' ? 'Global' : 'Restricted',
    dept: s.scope_type ? s.scope_type.toUpperCase() : '—',
    contact: s.contact_person || '—',
    phone: s.phone || '—',
    email: s.email || '—',
    address: s.address || '—',
    wallet: s.inbucks_number || '',
    verified: s.status === 'active' || s.status === 'approved',
    status: s.status || 'pending',
    cert: s.cert_expiry || null,
    spend: Number(s.mtd_spend ?? 0),
    ytd: Number(s.ytd_spend ?? 0),
    txns: Number(s.txns ?? 0),
    trend: s.trend ?? null,
    brands: Array.isArray(s.brands)
      ? s.brands.map((b) => brandTuple(typeof b === 'string' ? b : b?.name || ''))
      : [],
  })), [suppliersRaw]);

  // Map API product → UI shape. Supplier linkage & pricing live on the pivot
  // (listSupplierProducts) so default to '—'/0 in the catalog view.
  const PRODUCTS_DATA = useMemo(() => productsRaw.map((p) => ({
    id: p.id,
    code: p.code || '',
    name: p.name || '—',
    cat: categoryNameById[p.category_id] || p.category?.name || '—',
    dept: p.department || '—',
    supplier: p.supplier_name || '—',
    price: Number(p.default_price ?? p.price ?? 0),
    unit: p.unit || '—',
    minOrder: Number(p.min_order ?? 0),
    brands: p.brands_label || '—',
  })), [productsRaw, categoryNameById]);

  const handleVerifySupplier = async (s) => {
    try {
      await approveSupplier(s.id);
      addToast('ok', `${s.name} verified`, 'Supplier is now active on the platform');
      loadAll();
    } catch (err) {
      addToast('er', 'Verification failed', err?.response?.data?.message || err.message || 'Request failed');
    }
  };

  const handleReactivateSupplier = async (s) => {
    try {
      await reactivateSupplier(s.id);
      addToast('ok', `${s.name} reactivated`, 'Supplier is active again');
      loadAll();
    } catch (err) {
      addToast('er', 'Reactivation failed', err?.response?.data?.message || err.message || 'Request failed');
    }
  };

  const handleDeleteSupplier = async () => {
    if (!deleteSupplierTarget) return;
    try {
      await deleteSupplier(deleteSupplierTarget.id);
      addToast('ok', 'Supplier removed', deleteSupplierTarget.name);
      setDeleteSupplierTarget(null);
      // If we were viewing this supplier's profile, drop back to the list.
      if (supplierProfile?.id === deleteSupplierTarget.id) setSupplierProfile(null);
      loadAll();
    } catch (err) {
      addToast('er', 'Delete failed', err?.response?.data?.message || err.message || 'Request failed');
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteProductTarget) return;
    try {
      await deleteProcurementProduct(deleteProductTarget.id);
      addToast('ok', 'Product removed', deleteProductTarget.name);
      setDeleteProductTarget(null);
      loadAll();
    } catch (err) {
      addToast('er', 'Delete failed', err?.response?.data?.message || err.message || 'Request failed');
    }
  };

  const tabs = ['Overview', 'Supplier Profiles', 'Products', 'Analytics', 'Statements', 'Supplier Portal'];

  const filteredBreakdown = BREAKDOWN.filter(r => {
    if (brandFilter !== 'All Brands' && !r.brand.includes(brandFilter)) return false;
    if (catFilter !== 'All' && r.cat !== catFilter) return false;
    if (search && ![r.supplier, r.cat, r.brand, r.shop, r.loc].some(v => v.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  const uniqueCats = ['All', ...new Set(BREAKDOWN.map(r => r.cat))];
  const uniqueDepts = ['All', ...new Set(PRODUCTS_DATA.map(p => p.dept))];
  const uniqueSuppliers = ['All', ...new Set(PRODUCTS_DATA.map(p => p.supplier))];

  const filteredProducts = PRODUCTS_DATA.filter(p => {
    if (brandFilter !== 'All Brands' && !p.brands.includes(brandFilter) && p.brands !== 'All brands') return false;
    if (catFilter !== 'All' && p.cat !== catFilter) return false;
    if (search && ![p.code, p.name, p.cat, p.dept, p.supplier].some(v => v.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  const filteredStatements = SUPPLIER_STATEMENTS.filter(s => {
    if (stmtStatusFilter !== 'All' && s.status !== stmtStatusFilter) return false;
    if (stmtSearch && ![s.ref, s.supplier, s.total].some(v => v.toLowerCase().includes(stmtSearch.toLowerCase()))) return false;
    return true;
  });

  // Aggregate products for Analytics
  const productTrendData = (() => {
    const cats = [...new Set(PRODUCTS_DATA.map(p => p.cat))];
    return cats.map(cat => {
      const items = PRODUCTS_DATA.filter(p => p.cat === cat);
      const totalVal = items.reduce((s, p) => s + p.price * p.minOrder, 0);
      return { name: cat, val: totalVal, qty: items.length, brands: items[0]?.brands || '—', trend: Math.round(Math.random() * 20 - 5) };
    });
  })();

  const supplierTrendData = SUPPLIERS.map(s => ({ name: s.name, val: s.spend, qty: s.txns, brands: s.brands.map(b => b[0]).join(', '), trend: s.trend }));

  return (
    <>
      <div className="ph">
        <Breadcrumbs items={[
          { label: 'CVS' },
          { label: 'Procurement' },
          { label: 'Dashboard' },
        ]} />
        <div className="ptabs">
          {tabs.map((t, i) => (
            <button key={t} className={`ptab${tab === i ? ' on' : ''}`} onClick={() => setTab(i)}>{t}</button>
          ))}
        </div>
      </div>
      <div className="cnt">
        {loading && (
          <div className="ntf info" style={{ marginBottom: 12 }}>
            <div><div className="ntf-t">Loading procurement data…</div></div>
          </div>
        )}
        {loadError && !loading && (
          <div className="ntf er" style={{ marginBottom: 12 }}>
            <div>
              <div className="ntf-t">Could not load procurement data</div>
              <div className="ntf-b">{loadError}</div>
            </div>
            <button className="ab sec" style={{ height: 32, fontSize: 12 }} onClick={loadAll}>Retry</button>
          </div>
        )}

        {/* ── Tab 0: Overview ──────────────────────────────────────────── */}
        {tab === 0 && (<>
          <div className="kg c4">
            <div className="kc bl"><div className="kl">Total Supplier Spend (MTD)</div><div className="kv">{formatMoneyShort(hardcodedSpendMTD, currency)}</div><div className="kd up">↑ 8% vs Feb</div><div className="ki">💳</div></div>
            <div className="kc gn"><div className="kl">Active Suppliers</div><div className="kv">{SUPPLIERS.filter(s => s.verified).length}</div><div className="kd nt">{SUPPLIERS.filter(s => !s.verified).length} pending verification</div><div className="ki">✓</div></div>
            <div className="kc yw"><div className="kl">Products on File</div><div className="kv">{PRODUCTS_DATA.length}</div><div className="kd nt">Across {uniqueDepts.length - 1} departments</div><div className="ki">📦</div></div>
            <div className="kc rd"><div className="kl">Pending Statements</div><div className="kv">{SUPPLIER_STATEMENTS.filter(s => s.status !== 'SETTLED').length}</div><div className="kd dn">Requires attention</div><div className="ki">⚠</div></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <div className="tbbar"><div className="tbt">Top Suppliers by Spend — MTD</div></div>
              <table className="dt">
                <thead><tr><th>Supplier</th><th>Category</th><th>MTD Spend</th><th>Brands</th><th>Trend</th></tr></thead>
                <tbody>
                  {SUPPLIERS.slice(0, 5).length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--ts)', padding: 20 }}>No data yet.</td></tr>
                  ) : SUPPLIERS.slice(0, 5).map(s => (
                    <tr key={s.name} style={{ cursor: 'pointer' }} onClick={() => { setSupplierProfile(s); setTab(1); }}>
                      <td><strong>{s.name}</strong></td>
                      <td style={{ fontSize: 12, color: 'var(--ts)' }}>{s.cat}</td>
                      <td><strong>{formatMoneyShort(s.spend, currency)}</strong></td>
                      <td>{s.brands.map(([b, cls], i) => <span key={i} className={`bc2 ${cls}`} style={{ marginRight: 2, fontSize: 9 }}>{b.split(' ')[0] === 'Chicken' ? 'CI' : b.split(' ')[0] === 'Pizza' ? 'PI' : b.split(' ')[0] === 'Creamy' ? 'CR' : b === 'Steers' ? 'ST' : b[0]}</span>)}</td>
                      <td style={{ color: trendColor(s.trend), fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{trendLabel(s.trend)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <div className="tbbar"><div className="tbt">Product Categories — MTD</div></div>
              <table className="dt">
                <thead><tr><th>Category</th><th>Products</th><th>Value</th><th>vs Last Month</th></tr></thead>
                <tbody>
                  {productTrendData.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--ts)', padding: 20 }}>No data yet.</td></tr>
                  ) : productTrendData.map(p => (
                    <tr key={p.name}>
                      <td><strong>{p.name}</strong></td>
                      <td style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{p.qty}</td>
                      <td><strong>{formatMoneyShort(p.val, currency)}</strong></td>
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
              <option value="All Brands">All Brands</option><option value="Chicken Inn">Chicken Inn</option><option value="Pizza Inn">Pizza Inn</option><option value="Creamy Inn">Creamy Inn</option><option value="Nando's">Nando's</option><option value="Steers">Steers</option><option value="Roco Mamma's">Roco Mamma's</option><option value="Ocean Basket">Ocean Basket</option><option value="Hefelies">Hefelies</option><option value="Pastino's">Pastino's</option>
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
                    <td><strong>{formatMoneyShort(r.val, currency)}</strong></td>
                    <td>{r.qty}</td>
                    <td style={{ fontSize: 12, color: 'var(--ts)' }}>{r.last}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </>)}

        {/* ── Tab 1: Supplier Profiles ─────────────────────────────────── */}
        {tab === 1 && (<>
          {supplierProfile ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 8 }}>
                <button className="ab sec" style={{ height: 28, fontSize: 11, padding: '0 12px' }} onClick={() => setSupplierProfile(null)}>← All Suppliers</button>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="ab sec" style={{ height: 28, fontSize: 11, padding: '0 12px' }} onClick={() => setDocsSupplierTarget(suppliersRaw.find((x) => x.id === supplierProfile.id) || supplierProfile)}>📄 Documents</button>
                  <button className="ab sec" style={{ height: 28, fontSize: 11, padding: '0 12px' }} onClick={() => setEditSupplier(suppliersRaw.find((x) => x.id === supplierProfile.id) || supplierProfile)}>Edit</button>
                </div>
              </div>
              <div className="kg c4">
                <div className="kc bl"><div className="kl">MTD Spend</div><div className="kv">${supplierProfile.spend.toLocaleString()}</div><div className="kd up">This month</div><div className="ki">💳</div></div>
                <div className="kc gn"><div className="kl">YTD Spend</div><div className="kv">${supplierProfile.ytd.toLocaleString()}</div><div className="kd nt">Year to date</div><div className="ki">📊</div></div>
                <div className="kc yw"><div className="kl">Transactions</div><div className="kv">{supplierProfile.txns}</div><div className="kd nt">This month</div><div className="ki">🧾</div></div>
                <div className={`kc ${supplierProfile.verified ? 'gn' : 'rd'}`}><div className="kl">Status</div><div className="kv">{supplierProfile.verified ? 'Verified' : 'Pending'}</div><div className="kd nt">{supplierProfile.cert ? `Cert: ${supplierProfile.cert}` : 'No certification'}</div><div className="ki">{supplierProfile.verified ? '✓' : '⚠'}</div></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div style={{ background: 'var(--l1)', border: '1px solid var(--bs)', padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ts)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Contact Details</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span style={{ color: 'var(--ts)' }}>Contact Person</span><strong>{supplierProfile.contact}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span style={{ color: 'var(--ts)' }}>Phone</span><strong style={{ fontFamily: "'IBM Plex Mono',monospace" }}>{supplierProfile.phone}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span style={{ color: 'var(--ts)' }}>Email</span><strong style={{ color: 'var(--int)' }}>{supplierProfile.email}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span style={{ color: 'var(--ts)' }}>Address</span><strong>{supplierProfile.address}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span style={{ color: 'var(--ts)' }}>Department</span><strong>{supplierProfile.dept}</strong></div>
                  </div>
                </div>
                <div style={{ background: 'var(--l1)', border: '1px solid var(--bs)', padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ts)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Payment &amp; Certifications</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span style={{ color: 'var(--ts)' }}>InnBucks Wallet</span><code style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--int)' }}>{supplierProfile.wallet || '—'}</code></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span style={{ color: 'var(--ts)' }}>Category</span><strong>{supplierProfile.cat}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span style={{ color: 'var(--ts)' }}>Cert. Expiry</span><span style={{ fontSize: 12, fontFamily: "'IBM Plex Mono',monospace", color: supplierProfile.cert && new Date(supplierProfile.cert) < new Date('2025-07-01') ? 'var(--er-t)' : 'var(--ts)' }}>{supplierProfile.cert || '—'}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span style={{ color: 'var(--ts)' }}>MTD Trend</span><span style={{ color: trendColor(supplierProfile.trend), fontFamily: "'IBM Plex Mono',monospace" }}>{trendLabel(supplierProfile.trend)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span style={{ color: 'var(--ts)' }}>Brands Served</span><div>{supplierProfile.brands.map(([b, cls], i) => <span key={i} className={`bc2 ${cls}`} style={{ marginRight: 2, fontSize: 9 }}>{b[0]}{b.split(' ')[1]?.[0]||''}</span>)}</div></div>
                  </div>
                </div>
              </div>
              <div className="tbbar"><div className="tbt">Products Supplied by {supplierProfile.name}</div></div>
              <table className="dt">
                <thead><tr><th>Code</th><th>Product Name</th><th>Category</th><th>Price</th><th>Unit</th><th>Min Order</th><th>Brands</th></tr></thead>
                <tbody>
                  {PRODUCTS_DATA.filter(p => p.supplier === supplierProfile.name).length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--ts)', padding: 20 }}>No data yet.</td></tr>
                  ) : PRODUCTS_DATA.filter(p => p.supplier === supplierProfile.name).map(p => (
                    <tr key={p.code}>
                      <td><code style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--int)' }}>{p.code}</code></td>
                      <td><strong>{p.name}</strong></td>
                      <td style={{ fontSize: 12, color: 'var(--ts)' }}>{p.cat}</td>
                      <td><strong>{formatMoney(p.price, currency)}</strong></td>
                      <td style={{ fontSize: 12, color: 'var(--ts)' }}>{p.unit}</td>
                      <td style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{p.minOrder}</td>
                      <td style={{ fontSize: 11, color: 'var(--ts)' }}>{p.brands}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <>
              <div className="kg c4">
                <div className="kc bl"><div className="kl">Total Suppliers</div><div className="kv">{SUPPLIERS.length}</div><div className="kd nt">Registered on platform</div><div className="ki">🏭</div></div>
                <div className="kc gn"><div className="kl">Verified</div><div className="kv">{SUPPLIERS.filter(s => s.verified).length}</div><div className="kd nt">Active suppliers</div><div className="ki">✓</div></div>
                <div className="kc yw"><div className="kl">Pending</div><div className="kv">{SUPPLIERS.filter(s => !s.verified).length}</div><div className="kd nt">Awaiting verification</div><div className="ki">⏳</div></div>
                <div className="kc rd"><div className="kl">Cert. Expiring</div><div className="kv">{SUPPLIERS.filter(s => s.cert && new Date(s.cert) < new Date('2025-07-01')).length}</div><div className="kd dn">Within 3 months</div><div className="ki">⚠</div></div>
              </div>
              <div className="tbbar"><div className="tbt">All Supplier Profiles — Click a row to view details</div></div>
              <table className="dt">
                <thead><tr><th>Supplier</th><th>Category</th><th>Department</th><th>Contact</th><th>MTD Spend</th><th>Brands</th><th>Verified</th><th>Cert. Expiry</th></tr></thead>
                <tbody>
                  {SUPPLIERS.length === 0 ? (
                    <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--ts)', padding: 20 }}>No data yet.</td></tr>
                  ) : SUPPLIERS.map(s => (
                    <tr key={s.name} style={{ cursor: 'pointer' }} onClick={() => setSupplierProfile(s)}>
                      <td><strong>{s.name}</strong></td>
                      <td style={{ fontSize: 12, color: 'var(--ts)' }}>{s.cat}</td>
                      <td style={{ fontSize: 12 }}>{s.dept}</td>
                      <td style={{ fontSize: 12, color: 'var(--ts)' }}>{s.contact}</td>
                      <td><strong>{formatMoneyShort(s.spend, currency)}</strong></td>
                      <td>{s.brands.map(([b, cls], i) => <span key={i} className={`bc2 ${cls}`} style={{ marginRight: 2, fontSize: 9 }}>{b[0]}{b.split(' ')[1]?.[0]||''}</span>)}</td>
                      <td>{s.verified ? <StatusTag type="active" label="VERIFIED" /> : <StatusTag type="pending" label="PENDING" />}</td>
                      <td style={{ fontSize: 11, fontFamily: "'IBM Plex Mono',monospace", color: s.cert && new Date(s.cert) < new Date('2025-07-01') ? 'var(--er-t)' : 'var(--ts)' }}>{s.cert || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </>)}

        {/* ── Tab 2: Products ──────────────────────────────────────────── */}
        {tab === 2 && (<>
          <div className="kg c4">
            <div className="kc bl"><div className="kl">Total Products</div><div className="kv">{PRODUCTS_DATA.length}</div><div className="kd nt">Registered on platform</div><div className="ki">📦</div></div>
            <div className="kc gn"><div className="kl">Departments</div><div className="kv">{uniqueDepts.length - 1}</div><div className="kd nt">Active departments</div><div className="ki">🏢</div></div>
            <div className="kc yw"><div className="kl">Suppliers</div><div className="kv">{uniqueSuppliers.length - 1}</div><div className="kd nt">Product suppliers</div><div className="ki">🏭</div></div>
            <div className="kc rd"><div className="kl">Categories</div><div className="kv">{uniqueCats.length - 1}</div><div className="kd nt">Product categories</div><div className="ki">🏷</div></div>
          </div>
          <div className="tbbar">
            <div className="tbt">Product Catalogue</div>
            <input className="srch" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
            <select className="fsel" style={{ width: 130, height: 32, fontSize: 12 }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
              {uniqueCats.map(c => <option key={c}>{c}</option>)}
            </select>
            <select className="fsel" style={{ width: 150, height: 32, fontSize: 12 }} value={brandFilter} onChange={e => setBrandFilter(e.target.value)}>
              <option value="All Brands">All Brands</option><option value="Chicken Inn">Chicken Inn</option><option value="Pizza Inn">Pizza Inn</option><option value="Creamy Inn">Creamy Inn</option><option value="Nando's">Nando's</option><option value="Steers">Steers</option><option value="Roco Mamma's">Roco Mamma's</option><option value="Ocean Basket">Ocean Basket</option><option value="Hefelies">Hefelies</option><option value="Pastino's">Pastino's</option>
            </select>
            <button className="ab sec" style={{ height: 34, fontSize: 12 }} onClick={() => setManageCatsOpen(true)}>Manage Categories</button>
            <button className="ab pri" style={{ height: 34, fontSize: 12 }} onClick={() => { setEditProduct(null); setProductModalOpen(true); }}>+ New Product</button>
            <button className="ab sec" style={{ height: 34, fontSize: 12 }} onClick={() => addToast('ok', 'Exported', `${filteredProducts.length} products exported`)}>Export</button>
          </div>
          <table className="dt">
            <thead><tr><th>Code</th><th>Product Name</th><th>Category</th><th>Department</th><th>Supplier</th><th>Price (USD)</th><th>Unit</th><th>Min Order</th><th>Brands</th><th style={{ width: 110 }}>Action</th></tr></thead>
            <tbody>
              {filteredProducts.length === 0
                ? <tr><td colSpan={10} style={{ textAlign: 'center', color: 'var(--ts)', padding: 20 }}>No products match filter</td></tr>
                : filteredProducts.map(p => {
                  const raw = productsRaw.find((x) => x.id === p.id) || { id: p.id, code: p.code, name: p.name };
                  return (
                    <tr key={p.id}>
                      <td><code style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--int)' }}>{p.code}</code></td>
                      <td><strong>{p.name}</strong></td>
                      <td><span style={{ fontSize: 11, fontWeight: 600, color: 'var(--int)', background: 'var(--info-bg)', padding: '2px 8px', border: '1px solid var(--int)' }}>{p.cat}</span></td>
                      <td style={{ fontSize: 12, color: 'var(--ts)' }}>{p.dept}</td>
                      <td style={{ fontSize: 12 }}>{p.supplier}</td>
                      <td><strong style={{ fontFamily: "'IBM Plex Mono',monospace" }}>{formatMoney(p.price, currency)}</strong></td>
                      <td style={{ fontSize: 12, color: 'var(--ts)' }}>{p.unit}</td>
                      <td style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{p.minOrder}</td>
                      <td style={{ fontSize: 11, color: 'var(--ts)' }}>{p.brands}</td>
                      <td>
                        <div className="ra">
                          <button className="rb ed" onClick={() => { setEditProduct(raw); setProductModalOpen(false); }}>Edit</button>
                          <button className="rb rv" onClick={() => setDeleteProductTarget({ id: raw.id, name: raw.name })}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </>)}

        {/* ── Tab 3: Analytics ────────────────────────────────────────────── */}
        {tab === 3 && (<>
          <div className="kg c3">
            <div className="kc bl"><div className="kl">Total Spend (MTD)</div><div className="kv">{formatMoneyShort(hardcodedSpendMTD, currency)}</div><div className="kd up">↑ 8% vs Feb</div><div className="ki">💳</div></div>
            <div className="kc gn"><div className="kl">Top {analyticsMode === 'product' ? 'Category' : 'Supplier'}</div><div className="kv" style={{ fontSize: 16 }}>—</div><div className="kd nt">—</div><div className="ki">{analyticsMode === 'product' ? '🔧' : '🏭'}</div></div>
            <div className="kc yw"><div className="kl">Trend Direction</div><div className="kv">—</div><div className="kd nt">Overall positive</div><div className="ki">📈</div></div>
          </div>

          <div className="tbbar">
            <div className="tbt">Spend Analytics</div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className={`ab${analyticsMode === 'product' ? ' pri' : ''}`} style={{ height: 32, fontSize: 12 }} onClick={() => setAnalyticsMode('product')}>By Product</button>
              <button className={`ab${analyticsMode === 'supplier' ? ' pri' : ''}`} style={{ height: 32, fontSize: 12 }} onClick={() => setAnalyticsMode('supplier')}>By Supplier</button>
            </div>
            <select className="fsel" style={{ width: 140, height: 32, fontSize: 12 }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
              {uniqueCats.map(c => <option key={c}>{c}</option>)}
            </select>
            <select className="fsel" style={{ width: 130, height: 32, fontSize: 12 }} value={brandFilter} onChange={e => setBrandFilter(e.target.value)}>
              <option value="All Brands">All Brands</option><option value="Chicken Inn">Chicken Inn</option><option value="Pizza Inn">Pizza Inn</option><option value="Creamy Inn">Creamy Inn</option>
            </select>
          </div>

          {analyticsMode === 'product' ? (
            <table className="dt">
              <thead><tr><th>Category</th><th>Total Value</th><th>Products</th><th>Brands</th><th>vs Last Month</th></tr></thead>
              <tbody>
                {productTrendData.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--ts)', padding: 20 }}>No data yet.</td></tr>
                ) : productTrendData.map(p => (
                  <tr key={p.name}>
                    <td><strong>{p.name}</strong></td>
                    <td><strong>${p.val.toLocaleString()}</strong></td>
                    <td style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{p.qty}</td>
                    <td style={{ fontSize: 11, color: 'var(--ts)' }}>{p.brands}</td>
                    <td style={{ color: trendColor(p.trend), fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{trendLabel(p.trend)}</td>
                  </tr>
                ))}
                <tr style={{ background: 'var(--l2)' }}>
                  <td><strong>TOTAL</strong></td>
                  <td><strong>${productTrendData.reduce((s, p) => s + p.val, 0).toLocaleString()}</strong></td>
                  <td style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{productTrendData.reduce((s, p) => s + p.qty, 0)}</td>
                  <td>—</td><td>—</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <table className="dt">
              <thead><tr><th>Supplier</th><th>Category</th><th>MTD Spend</th><th>YTD Spend</th><th>Transactions</th><th>Brands</th><th>vs Last Month</th></tr></thead>
              <tbody>
                {SUPPLIERS.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--ts)', padding: 20 }}>No data yet.</td></tr>
                ) : SUPPLIERS.map(s => (
                  <tr key={s.name}>
                    <td><strong>{s.name}</strong></td>
                    <td style={{ fontSize: 12, color: 'var(--ts)' }}>{s.cat}</td>
                    <td><strong>{formatMoneyShort(s.spend, currency)}</strong></td>
                    <td style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{formatMoneyShort(s.ytd, currency)}</td>
                    <td style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{s.txns}</td>
                    <td>{s.brands.map(([b, cls], i) => <span key={i} className={`bc2 ${cls}`} style={{ marginRight: 2, fontSize: 9 }}>{b[0]}{b.split(' ')[1]?.[0]||''}</span>)}</td>
                    <td style={{ color: trendColor(s.trend), fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{trendLabel(s.trend)}</td>
                  </tr>
                ))}
                <tr style={{ background: 'var(--l2)' }}>
                  <td><strong>TOTAL</strong></td>
                  <td>—</td>
                  <td><strong>${SUPPLIERS.reduce((s, sup) => s + sup.spend, 0).toLocaleString()}</strong></td>
                  <td style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>${SUPPLIERS.reduce((s, sup) => s + sup.ytd, 0).toLocaleString()}</td>
                  <td style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{SUPPLIERS.reduce((s, sup) => s + sup.txns, 0)}</td>
                  <td>—</td><td>—</td>
                </tr>
              </tbody>
            </table>
          )}
        </>)}

        {/* ── Tab 4: Statements ────────────────────────────────────────── */}
        {tab === 4 && (<>
          <div className="ntf info" style={{ marginBottom: 16 }}>
            <div>
              <div className="ntf-t">Supplier Statements</div>
              <div className="ntf-b">View and manage supplier invoices and payment status. Settled statements are fully paid. Pending statements are within their payment window. Overdue statements require immediate action.</div>
            </div>
          </div>
          <div className="kg c4">
            <div className="kc gn"><div className="kl">Settled</div><div className="kv">{SUPPLIER_STATEMENTS.filter(s => s.status === 'SETTLED').length}</div><div className="kd nt">Fully paid</div><div className="ki">✓</div></div>
            <div className="kc yw"><div className="kl">Pending</div><div className="kv">{SUPPLIER_STATEMENTS.filter(s => s.status === 'PENDING').length}</div><div className="kd nt">Within payment window</div><div className="ki">⏳</div></div>
            <div className="kc rd"><div className="kl">Overdue</div><div className="kv">{SUPPLIER_STATEMENTS.filter(s => s.status === 'OVERDUE').length}</div><div className="kd dn">Requires action</div><div className="ki">🚨</div></div>
            <div className="kc bl"><div className="kl">Total Value</div><div className="kv">${SUPPLIER_STATEMENTS.reduce((s, st) => s + parseFloat(st.total.replace(/[$,]/g, '')), 0).toLocaleString()}</div><div className="kd nt">All statements</div><div className="ki">💳</div></div>
          </div>
          <div className="tbbar">
            <div className="tbt">Statements</div>
            <input className="srch" placeholder="Search ref or supplier…" value={stmtSearch} onChange={e => setStmtSearch(e.target.value)} />
            <select className="fsel" style={{ width: 120, height: 32, fontSize: 12 }} value={stmtStatusFilter} onChange={e => setStmtStatusFilter(e.target.value)}>
              <option>All</option><option>SETTLED</option><option>PENDING</option><option>OVERDUE</option>
            </select>
            <button className="ab sec" style={{ height: 34, fontSize: 12 }} onClick={() => addToast('ok', 'Exported', `${filteredStatements.length} statements exported`)}>Export</button>
          </div>
          <table className="dt">
            <thead><tr><th>Reference</th><th>Supplier</th><th>Date</th><th>Items</th><th>Total</th><th>Due Date</th><th>Paid Date</th><th>Status</th></tr></thead>
            <tbody>
              {filteredStatements.length === 0
                ? <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--ts)', padding: 20 }}>No statements match filter</td></tr>
                : filteredStatements.map(s => (
                  <tr key={s.ref}>
                    <td><code style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--int)' }}>{s.ref}</code></td>
                    <td><strong>{s.supplier}</strong></td>
                    <td style={{ fontSize: 12, color: 'var(--ts)' }}>{s.date}</td>
                    <td style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{s.items}</td>
                    <td><strong>{s.total}</strong></td>
                    <td style={{ fontSize: 12, fontFamily: "'IBM Plex Mono',monospace" }}>{s.dueDate}</td>
                    <td style={{ fontSize: 12, fontFamily: "'IBM Plex Mono',monospace", color: s.paidDate ? 'var(--ok-t)' : 'var(--ts)' }}>{s.paidDate || '—'}</td>
                    <td><StatusTag type={s.status === 'SETTLED' ? 'paid' : s.status === 'OVERDUE' ? 'over' : 'review'} label={s.status} /></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
          <div style={{ marginTop: 12, display: 'flex', gap: 16, fontSize: 11, color: 'var(--ts)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><StatusTag type="paid" label="SETTLED" /> Fully paid within terms</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><StatusTag type="review" label="PENDING" /> Within payment window</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><StatusTag type="over" label="OVERDUE" /> Past due date — action required</span>
          </div>
        </>)}

        {/* ── Tab 5: Supplier Portal ────────────────────────────────────── */}
        {tab === 5 && (<>
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
            <div className="kc bl"><div className="kl">Brands Covered</div><div className="kv">—</div><div className="kd nt">All brands onboarded</div><div className="ki">🏷</div></div>
          </div>
          <div className="tbbar">
            <div className="tbt">Supplier Registry</div>
            <button className="ab pri" style={{ height: 34, fontSize: 12 }} onClick={() => { setEditSupplier(null); setSupplierModalOpen(true); }}>+ Register Supplier</button>
          </div>
          <table className="dt">
            <thead><tr><th>Supplier</th><th>Category</th><th>InnBucks Wallet</th><th>Status</th><th>Cert. Expiry</th><th>MTD Spend</th><th>Brands</th><th style={{ minWidth: 280 }}>Action</th></tr></thead>
            <tbody>
              {SUPPLIERS.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--ts)', padding: 20 }}>No data yet.</td></tr>
              ) : SUPPLIERS.map(s => {
                const raw = suppliersRaw.find((x) => x.id === s.id) || s;
                const status = (s.status || '').toLowerCase();
                const isPending = status === 'pending' || (!s.verified && status !== 'suspended' && status !== 'rejected');
                const isSuspended = status === 'suspended';
                const isActive = s.verified && !isSuspended;
                const tagType = isSuspended ? 'over' : isActive ? 'active' : 'pending';
                const tagLabel = isSuspended ? 'SUSPENDED' : isActive ? 'VERIFIED' : (status || 'PENDING').toUpperCase();
                return (
                  <tr key={s.id || s.name}>
                    <td><strong>{s.name}</strong></td>
                    <td style={{ fontSize: 12, color: 'var(--ts)' }}>{s.cat}</td>
                    <td>
                      {s.wallet
                        ? <code style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--int)' }}>{s.wallet}</code>
                        : <span style={{ color: 'var(--ts)', fontSize: 12 }}>—</span>
                      }
                    </td>
                    <td><StatusTag type={tagType} label={tagLabel} /></td>
                    <td style={{ fontSize: 11, fontFamily: "'IBM Plex Mono',monospace", color: s.cert && new Date(s.cert) < new Date('2025-07-01') ? 'var(--er-t)' : 'var(--ts)' }}>
                      {s.cert || '—'}
                      {s.cert && new Date(s.cert) < new Date('2025-07-01') && <span style={{ color: 'var(--er)', marginLeft: 4 }}>⚠</span>}
                    </td>
                    <td><strong>{formatMoneyShort(s.spend, currency)}</strong></td>
                    <td>{s.brands.map(([b, cls], i) => <span key={i} className={`bc2 ${cls}`} style={{ marginRight: 2, fontSize: 9 }}>{b[0]}{b.split(' ')[1]?.[0]||''}</span>)}</td>
                    <td>
                      <div className="ra">
                        {isPending && <button className="rb ap" onClick={() => handleVerifySupplier(s)}>Verify</button>}
                        {isPending && <button className="rb rv" onClick={() => setRejectSupplierTarget(raw)}>Reject</button>}
                        {isActive && <button className="rb rv" onClick={() => setSuspendSupplierTarget(raw)}>Suspend</button>}
                        {isSuspended && <button className="rb ap" onClick={() => handleReactivateSupplier(s)}>Reactivate</button>}
                        <button className="rb ed" onClick={() => setEditSupplier(raw)}>Edit</button>
                        <button className="rb ed" onClick={() => setDocsSupplierTarget(raw)} title="Documents">Docs</button>
                        <button className="rb ed" onClick={() => { setSupplierProfile(s); setTab(1); }} title="View profile">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                        </button>
                        <button className="rb rv" onClick={() => setDeleteSupplierTarget({ id: s.id, name: s.name })}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>)}
      </div>

      {/* ── Procurement modals ────────────────────────────────────────── */}
      <NewSupplierModal
        open={supplierModalOpen}
        supplier={editSupplier}
        onClose={(changed) => {
          setSupplierModalOpen(false);
          setEditSupplier(null);
          if (changed) loadAll();
        }}
      />
      <RejectSupplierModal
        supplier={rejectSupplierTarget}
        onClose={(changed) => { setRejectSupplierTarget(null); if (changed) loadAll(); }}
      />
      <SuspendSupplierModal
        supplier={suspendSupplierTarget}
        onClose={(changed) => { setSuspendSupplierTarget(null); if (changed) loadAll(); }}
      />
      <ConfirmDeleteModal
        open={!!deleteSupplierTarget}
        title="Delete Supplier"
        subtitle={deleteSupplierTarget?.name}
        message={`Permanently remove “${deleteSupplierTarget?.name}” from the registry? Any historical references will remain in audit logs.`}
        onConfirm={handleDeleteSupplier}
        onClose={() => setDeleteSupplierTarget(null)}
      />
      <SupplierDocumentsModal
        open={!!docsSupplierTarget}
        supplier={docsSupplierTarget}
        onClose={() => setDocsSupplierTarget(null)}
      />
      <ProcurementProductModal
        open={productModalOpen}
        product={editProduct}
        categories={categoriesRaw}
        onClose={(changed) => {
          setProductModalOpen(false);
          setEditProduct(null);
          if (changed) loadAll();
        }}
      />
      <ConfirmDeleteModal
        open={!!deleteProductTarget}
        title="Delete Product"
        subtitle={deleteProductTarget?.name}
        message={`Remove “${deleteProductTarget?.name}” from the catalogue?`}
        onConfirm={handleDeleteProduct}
        onClose={() => setDeleteProductTarget(null)}
      />
      <ManageCategoriesModal
        open={manageCatsOpen}
        categories={categoriesRaw}
        onClose={() => setManageCatsOpen(false)}
        onChanged={loadAll}
      />
    </>
  );
}
