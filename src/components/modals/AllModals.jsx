import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import CvsModal from './CvsModal';
import StatusTag from '../shared/StatusTag';
import BrandChip from '../shared/BrandChip';
import { BRANDS } from '../../data/mockData';
import {
  inviteUser,
  listRoles,
  listBrands,
  createUser,
  updateUser,
  updateUserStatus,
  createBrand,
  updateBrand,
  createShop,
  updateShop,
  showBrand,
  showShop,
  listShopsForBrand,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  rejectSupplier,
  suspendSupplier,
  reactivateSupplier,
  createProcurementProduct,
  updateProcurementProduct,
  deleteProcurementProduct,
  createProcurementCategory,
  updateProcurementCategory,
  deleteProcurementCategory,
  listSupplierDocuments,
  uploadSupplierDocument,
  approveSupplierDocument,
  rejectSupplierDocument,
  deleteSupplierDocument,
  showUser,
  showInvitation,
  showSupplier,
  showProcurementProduct,
  showProcurementCategory,
  listSupplierProducts,
  linkSupplierProduct,
  updateSupplierProduct,
  unlinkSupplierProduct,
  syncSupplierBrands,
  listProcurementProducts,
  changePassword,
  listPermissions,
  assignUserRole,
  syncRolePermissions,
  createRole,
  updateRole,
  deleteRole,
  showRole,
  updateUserRoleAssignment,
  removeUserRoleAssignment,
  showProcurementRequest,
  createBudget,
  updateBudget,
  deleteBudget,
} from '../../lib/cvsApi';

function extractApiError(err, fallback = 'Request failed') {
  const data = err?.response?.data;
  if (data?.errors) {
    return Object.entries(data.errors)
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`)
      .join(' · ');
  }
  return data?.message || err?.message || fallback;
}

/* ── Procurement Request Detail Modal — fetches full record on open ─────── */
export function ProcurementRequestDetailModal({ requestId, onClose }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!requestId) { setData(null); setErr(''); return; }
    let cancelled = false;
    setLoading(true);
    setErr('');
    showProcurementRequest(requestId)
      .then((res) => {
        if (cancelled) return;
        // Backend returns either { data: {...} } or the record directly.
        setData(res?.data || res);
      })
      .catch((e) => !cancelled && setErr(extractApiError(e, 'Failed to load request')))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [requestId]);

  if (!requestId) return null;
  const amt = Number(data?.amount || 0);

  return (
    <CvsModal open={!!requestId} onClose={onClose} size="md"
      title={`Request — ${requestId.slice(0, 8)}…`}
      subtitle={data?.status ? data.status.toUpperCase() : (loading ? 'Loading…' : '')}
      footer={<button className="ab pri lg" onClick={onClose}>Close</button>}
    >
      {loading && <div style={{ color: 'var(--ts)', fontSize: 12 }}>Loading…</div>}
      {err && (
        <div className="ntf er">
          <div>
            <div className="ntf-t">Could not load request</div>
            <div className="ntf-b">{err}</div>
          </div>
        </div>
      )}
      {data && !loading && [
        { label: 'Request ID', value: <code style={{ color: 'var(--info)', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11 }}>{data.id || requestId}</code> },
        { label: 'Status', value: <StatusTag type={data.status || 'pending'} /> },
        { label: 'Amount', value: <span style={{ fontWeight: 700, color: 'var(--int)', fontSize: 18, fontFamily: "'IBM Plex Sans Condensed',sans-serif" }}>${amt.toFixed(2)}</span> },
        { label: 'Category', value: data.category?.name || '—' },
        { label: 'Supplier', value: data.supplier?.name || '—' },
        { label: 'Shop', value: data.shop?.name || '—' },
        { label: 'Brand', value: data.brand?.name || data.shop?.brand?.name || '—' },
        { label: 'Requested by', value: data.requested_by?.full_name || data.requested_by?.name || '—' },
        { label: 'Created', value: data.created_at ? new Date(data.created_at).toLocaleString() : '—' },
        { label: 'Updated', value: data.updated_at ? new Date(data.updated_at).toLocaleString() : '—' },
        { label: 'Description', value: data.description || data.purpose || '—' },
        ...(data.rejected_reason ? [{ label: 'Rejection reason', value: <span style={{ color: 'var(--er-t)' }}>{data.rejected_reason}</span> }] : []),
        ...(data.approved_by ? [{ label: 'Approved by', value: data.approved_by?.full_name || data.approved_by?.name || '—' }] : []),
      ].map((row, i, arr) => (
        <div key={i} className="cvs-detail-row" style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--bs)' : 'none' }}>
          <span className="cvs-detail-label">{row.label}</span>
          <span style={{ fontSize: 13 }}>{row.value}</span>
        </div>
      ))}
    </CvsModal>
  );
}

/* ── Request Detail Modal ───────────────────────────────────────────────── */
export function RequestDetailModal({ request, onClose }) {
  if (!request) return null;
  return (
    <CvsModal open={!!request} onClose={onClose} title={`Request Detail — ${request.id}`} subtitle={`${request.cat} · ${request.supplier}`}
      footer={<button className="ab pri lg" onClick={onClose}>Close</button>}
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
        <button className="ab dan" style={{ height: 42, padding: '0 20px' }} disabled={!reason} onClick={() => { onConfirm?.(reason); onClose(); setReason(''); }}>Confirm Rejection</button>
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
export function EditUserModal({ user, roles = [], brands = [], onClose }) {
  const { addToast } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('active');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || user.raw?.full_name || '');
      setPhone(user.raw?.phone || '');
      setStatus(user.raw?.status || 'active');
    }
  }, [user]);

  if (!user) return null;
  const role = roles.find((r) => r.id === user.roleId);

  const save = async () => {
    setSaving(true);
    try {
      await updateUser(user.id, {
        full_name: name.trim(),
        phone: phone.trim() || null,
      });
      if (status !== (user.raw?.status || 'active')) {
        await updateUserStatus(user.id, status);
      }
      addToast('ok', 'User updated', `${name} saved`);
      onClose(true);
    } catch (err) {
      addToast('er', 'Update failed', extractApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <CvsModal
      open={!!user}
      onClose={() => onClose(false)}
      title="Edit User"
      subtitle={user.email}
      footer={
        <>
          <button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={() => onClose(false)}>Cancel</button>
          <button className="ab pri" style={{ height: 42, padding: '0 20px' }} disabled={saving || !name.trim()} onClick={save}>{saving ? 'Saving…' : 'Save Changes'}</button>
        </>
      }
    >
      <div className="fg">
        <div className="fi"><label className="fl">Full Name</label><input className="fin" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="fi"><label className="fl">Email</label><input className="fin" type="email" value={user.email} readOnly /></div>
        <div className="fi"><label className="fl">Phone</label><input className="fin" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" /></div>
        <div className="fi">
          <label className="fl">Status</label>
          <select className="fsel" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <div className="fi">
          <label className="fl">Role</label>
          <input className="fin" value={role?.name || '—'} readOnly />
          <div className="fh">Role assignment is managed via invitations.</div>
        </div>
      </div>
    </CvsModal>
  );
}

/* ── Revoke User Modal ──────────────────────────────────────────────────── */
export function RevokeUserModal({ user, onClose }) {
  const { addToast } = useApp();
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const revoke = async () => {
    setSaving(true);
    try {
      await updateUserStatus(user.id, 'inactive');
      addToast('ok', 'Access revoked', `${user.name} has been deactivated`);
      onClose(true);
    } catch (err) {
      addToast('er', 'Revoke failed', extractApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <CvsModal
      open={!!user}
      onClose={() => onClose(false)}
      title="Revoke Access"
      subtitle={user.email}
      footer={
        <>
          <button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={() => onClose(false)}>Cancel</button>
          <button className="ab dan" style={{ height: 42, padding: '0 20px' }} disabled={saving} onClick={revoke}>{saving ? 'Revoking…' : 'Revoke Access'}</button>
        </>
      }
    >
      <div style={{ padding: 12, background: 'var(--er-bg)', borderLeft: '3px solid var(--er)', marginBottom: 13 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--er-t)', marginBottom: 3 }}>Deactivate system access for {user.name}?</div>
        <div style={{ fontSize: 12, color: 'var(--ts)' }}>Account will be marked inactive. User won't be able to log in until reactivated.</div>
      </div>
      <div className="cvs-detail-row"><span className="cvs-detail-label">Role</span><span>{user.roleLabel}</span></div>
      <div className="cvs-detail-row"><span className="cvs-detail-label">Brand</span><span>{user.brand}</span></div>
      <div className="cvs-detail-row" style={{ borderBottom: 'none' }}><span className="cvs-detail-label">Email</span><span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{user.email}</span></div>
    </CvsModal>
  );
}

/* ── Create User Modal (direct creation, no invitation) ─────────────────── */
export function CreateUserModal({ open, onClose }) {
  const { addToast } = useApp();
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '' });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.full_name.trim() && form.email.includes('@');

  const close = (changed) => {
    onClose(changed);
    setForm({ full_name: '', email: '', phone: '', password: '' });
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
      };
      if (form.phone.trim()) payload.phone = form.phone.trim();
      if (form.password) payload.password = form.password;
      await createUser(payload);
      addToast('ok', 'User created', `${payload.full_name} added`);
      close(true);
    } catch (err) {
      addToast('er', 'Create failed', extractApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <CvsModal
      open={!!open}
      onClose={() => close(false)}
      title="Create User"
      subtitle="Direct account creation (bypasses invitation email)"
      footer={
        <>
          <button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={() => close(false)}>Cancel</button>
          <button className="ab pri" style={{ height: 42, padding: '0 20px' }} disabled={!valid || saving} onClick={save}>{saving ? 'Creating…' : 'Create User'}</button>
        </>
      }
    >
      <div className="fg">
        <div className="fi"><label className="fl">Full Name</label><input className="fin" value={form.full_name} onChange={(e) => set('full_name', e.target.value)} placeholder="First Last" /></div>
        <div className="fi"><label className="fl">Email Address</label><input className="fin" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="name@simbisa.co.zw" /></div>
        <div className="fi"><label className="fl">Phone</label><input className="fin" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="Optional" /></div>
        <div className="fi"><label className="fl">Temporary Password</label><input className="fin" type="password" value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="Optional" /><div className="fh">If omitted, the backend sets its own default.</div></div>
      </div>
      <div style={{ marginTop: 12, padding: 10, background: 'var(--info-bg)', borderLeft: '3px solid var(--int)', fontSize: 11, color: 'var(--ts)' }}>
        Role assignment happens via the Invitations flow. Users created here start with no role.
      </div>
    </CvsModal>
  );
}

/* ── Brand Edit/Create Modal ────────────────────────────────────────────── */
export function BrandEditModal({ brand, onClose }) {
  const { addToast } = useApp();
  const [form, setForm] = useState({ code: '', name: '', status: 'active' });
  const [saving, setSaving] = useState(false);
  const editing = !!brand?.id;

  useEffect(() => {
    if (brand) {
      setForm({ code: brand.code || '', name: brand.name || '', status: brand.status || 'active' });
    }
  }, [brand]);

  if (!brand) return null;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.code.trim() && form.name.trim();

  const save = async () => {
    setSaving(true);
    try {
      const payload = { code: form.code.trim(), name: form.name.trim(), status: form.status };
      if (editing) await updateBrand(brand.id, payload);
      else await createBrand(payload);
      addToast('ok', editing ? 'Brand updated' : 'Brand created', form.name);
      onClose(true);
    } catch (err) {
      addToast('er', 'Save failed', extractApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <CvsModal
      open={!!brand}
      onClose={() => onClose(false)}
      title={editing ? 'Edit Brand' : 'New Brand'}
      subtitle={editing ? brand.name : 'Add a new brand to the catalog'}
      footer={
        <>
          <button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={() => onClose(false)}>Cancel</button>
          <button className="ab pri" style={{ height: 42, padding: '0 20px' }} disabled={!valid || saving} onClick={save}>{saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Brand'}</button>
        </>
      }
    >
      <div className="fg">
        <div className="fi"><label className="fl">Code</label><input className="fin" value={form.code} onChange={(e) => set('code', e.target.value)} placeholder="e.g. CHICKEN_INN" /></div>
        <div className="fi"><label className="fl">Name</label><input className="fin" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Chicken Inn" /></div>
        <div className="fi">
          <label className="fl">Status</label>
          <select className="fsel" value={form.status} onChange={(e) => set('status', e.target.value)}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    </CvsModal>
  );
}

/* ── Shop Edit/Create Modal ─────────────────────────────────────────────── */
export function ShopEditModal({ shop, brands = [], onClose }) {
  const { addToast } = useApp();
  const [form, setForm] = useState({ brand_id: '', code: '', name: '', location: '', status: 'active' });
  const [saving, setSaving] = useState(false);
  const editing = !!shop?.id;

  useEffect(() => {
    if (shop) {
      setForm({
        brand_id: shop.brand_id || '',
        code: shop.code || '',
        name: shop.name || '',
        location: shop.location || '',
        status: shop.status || 'active',
      });
    }
  }, [shop]);

  if (!shop) return null;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.brand_id && form.code.trim() && form.name.trim();

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        brand_id: form.brand_id,
        code: form.code.trim(),
        name: form.name.trim(),
        location: form.location.trim() || null,
        status: form.status,
      };
      if (editing) await updateShop(shop.id, payload);
      else await createShop(payload);
      addToast('ok', editing ? 'Shop updated' : 'Shop created', form.name);
      onClose(true);
    } catch (err) {
      addToast('er', 'Save failed', extractApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <CvsModal
      open={!!shop}
      onClose={() => onClose(false)}
      title={editing ? 'Edit Shop' : 'New Shop'}
      subtitle={editing ? shop.name : 'Add a new shop under a brand'}
      footer={
        <>
          <button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={() => onClose(false)}>Cancel</button>
          <button className="ab pri" style={{ height: 42, padding: '0 20px' }} disabled={!valid || saving} onClick={save}>{saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Shop'}</button>
        </>
      }
    >
      <div className="fg">
        <div className="fi">
          <label className="fl">Brand</label>
          <select className="fsel" value={form.brand_id} onChange={(e) => set('brand_id', e.target.value)}>
            <option value="">Select a brand</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div className="fi"><label className="fl">Code</label><input className="fin" value={form.code} onChange={(e) => set('code', e.target.value)} placeholder="e.g. SHOP-014" /></div>
        <div className="fi"><label className="fl">Name</label><input className="fin" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Borrowdale Branch" /></div>
        <div className="fi"><label className="fl">Location</label><input className="fin" value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="e.g. Harare, Borrowdale" /></div>
        <div className="fi">
          <label className="fl">Status</label>
          <select className="fsel" value={form.status} onChange={(e) => set('status', e.target.value)}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    </CvsModal>
  );
}

/* ── Brand Detail Modal (read-only) ─────────────────────────────────────── */
export function BrandDetailModal({ brandId, onClose }) {
  const [brand, setBrand] = useState(null);
  const [brandShops, setBrandShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!brandId) return;
    let cancelled = false;
    setLoading(true);
    setErr('');
    Promise.all([showBrand(brandId), listShopsForBrand(brandId).catch(() => [])])
      .then(([b, s]) => {
        if (cancelled) return;
        setBrand(b || null);
        setBrandShops(Array.isArray(s) ? s : []);
      })
      .catch((e) => !cancelled && setErr(extractApiError(e, 'Failed to load brand')))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
      setBrand(null);
      setBrandShops([]);
    };
  }, [brandId]);

  if (!brandId) return null;

  return (
    <CvsModal
      open={!!brandId}
      onClose={onClose}
      title={brand?.name || 'Brand'}
      subtitle={brand?.code ? `Code: ${brand.code}` : 'Brand details'}
      size="lg"
      footer={<button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={onClose}>Close</button>}
    >
      {loading && <div style={{ color: 'var(--ts)', fontSize: 12 }}>Loading…</div>}
      {err && !loading && <div className="ntf er"><div><div className="ntf-t">Could not load brand</div><div className="ntf-b">{err}</div></div></div>}
      {brand && !loading && (
        <>
          <div className="fg">
            <div className="fi"><label className="fl">Code</label><div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{brand.code || '—'}</div></div>
            <div className="fi"><label className="fl">Name</label><div style={{ fontWeight: 600 }}>{brand.name || '—'}</div></div>
            <div className="fi"><label className="fl">Status</label><div><StatusTag type={brand.status || 'active'} /></div></div>
            {brand.created_at && (
              <div className="fi"><label className="fl">Created</label><div style={{ fontSize: 12, color: 'var(--ts)' }}>{new Date(brand.created_at).toLocaleString()}</div></div>
            )}
          </div>
          <div className="tbbar" style={{ marginTop: 20 }}>
            <div className="tbt">Shops in this brand ({brandShops.length})</div>
          </div>
          <table className="dt">
            <thead><tr><th>Code</th><th>Name</th><th>Location</th><th>Status</th></tr></thead>
            <tbody>
              {brandShops.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--ts)', padding: 16 }}>No shops registered.</td></tr>
              ) : brandShops.map((s) => (
                <tr key={s.id}>
                  <td><code style={{ color: 'var(--info)', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11 }}>{s.code}</code></td>
                  <td><strong>{s.name}</strong></td>
                  <td style={{ fontSize: 12, color: 'var(--ts)' }}>{s.location || '—'}</td>
                  <td><StatusTag type={s.status || 'active'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </CvsModal>
  );
}

/* ── Shop Detail Modal (read-only) ──────────────────────────────────────── */
export function ShopDetailModal({ shopId, onClose }) {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!shopId) return;
    let cancelled = false;
    setLoading(true);
    setErr('');
    showShop(shopId)
      .then((s) => !cancelled && setShop(s || null))
      .catch((e) => !cancelled && setErr(extractApiError(e, 'Failed to load shop')))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
      setShop(null);
    };
  }, [shopId]);

  if (!shopId) return null;
  const brandName = shop?.brand?.name || shop?.brand_name;

  return (
    <CvsModal
      open={!!shopId}
      onClose={onClose}
      title={shop?.name || 'Shop'}
      subtitle={shop?.code ? `Code: ${shop.code}` : 'Shop details'}
      size="md"
      footer={<button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={onClose}>Close</button>}
    >
      {loading && <div style={{ color: 'var(--ts)', fontSize: 12 }}>Loading…</div>}
      {err && !loading && <div className="ntf er"><div><div className="ntf-t">Could not load shop</div><div className="ntf-b">{err}</div></div></div>}
      {shop && !loading && (
        <div className="fg">
          <div className="fi"><label className="fl">Code</label><div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{shop.code || '—'}</div></div>
          <div className="fi"><label className="fl">Name</label><div style={{ fontWeight: 600 }}>{shop.name || '—'}</div></div>
          <div className="fi"><label className="fl">Brand</label><div>{brandName ? <BrandChip brand={brandName} /> : <span style={{ color: 'var(--ts)', fontSize: 12 }}>—</span>}</div></div>
          <div className="fi"><label className="fl">Location</label><div>{shop.location || '—'}</div></div>
          <div className="fi"><label className="fl">Status</label><div><StatusTag type={shop.status || 'active'} /></div></div>
          {shop.created_at && (
            <div className="fi"><label className="fl">Created</label><div style={{ fontSize: 12, color: 'var(--ts)' }}>{new Date(shop.created_at).toLocaleString()}</div></div>
          )}
        </div>
      )}
    </CvsModal>
  );
}

/* ── User Detail Modal (read-only) ──────────────────────────────────────── */
export function UserDetailModal({ userId, onClose }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setLoading(true);
    setErr('');
    showUser(userId)
      .then((u) => !cancelled && setUser(u || null))
      .catch((e) => !cancelled && setErr(extractApiError(e, 'Failed to load user')))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; setUser(null); };
  }, [userId]);

  if (!userId) return null;
  const assignments = user?.assignments || [];

  return (
    <CvsModal
      open={!!userId}
      onClose={onClose}
      title={user?.full_name || 'User'}
      subtitle={user?.email || 'User details'}
      size="lg"
      footer={<button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={onClose}>Close</button>}
    >
      {loading && <div style={{ color: 'var(--ts)', fontSize: 12 }}>Loading…</div>}
      {err && !loading && <div className="ntf er"><div><div className="ntf-t">Could not load user</div><div className="ntf-b">{err}</div></div></div>}
      {user && !loading && (
        <>
          <div className="fg">
            <div className="fi"><label className="fl">Full Name</label><div style={{ fontWeight: 600 }}>{user.full_name || '—'}</div></div>
            <div className="fi"><label className="fl">Email</label><div>{user.email || '—'}</div></div>
            <div className="fi"><label className="fl">Phone</label><div>{user.phone || '—'}</div></div>
            <div className="fi"><label className="fl">Status</label><div><StatusTag type={user.status || 'active'} /></div></div>
            {user.last_login_at && (
              <div className="fi"><label className="fl">Last Login</label><div style={{ fontSize: 12, color: 'var(--ts)' }}>{new Date(user.last_login_at).toLocaleString()}</div></div>
            )}
            {user.created_at && (
              <div className="fi"><label className="fl">Created</label><div style={{ fontSize: 12, color: 'var(--ts)' }}>{new Date(user.created_at).toLocaleString()}</div></div>
            )}
          </div>
          <div className="tbbar" style={{ marginTop: 20 }}>
            <div className="tbt">Role Assignments ({assignments.length})</div>
          </div>
          <table className="dt">
            <thead><tr><th>Role</th><th>Brand</th><th>Shop</th><th>Active</th></tr></thead>
            <tbody>
              {assignments.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--ts)', padding: 16 }}>No role assignments.</td></tr>
              ) : assignments.map((a) => (
                <tr key={a.id || `${a.role_id}-${a.brand_id}-${a.shop_id}`}>
                  <td>{a.role?.name || '—'}</td>
                  <td>{a.brand?.name || '—'}</td>
                  <td>{a.shop?.name || '—'}</td>
                  <td>{a.is_active ? <StatusTag type="active" label="ACTIVE" /> : <span style={{ color: 'var(--ts)', fontSize: 12 }}>inactive</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </CvsModal>
  );
}

/* ── Invitation Detail Modal (read-only) ────────────────────────────────── */
export function InvitationDetailModal({ invitationId, onClose }) {
  const [inv, setInv] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!invitationId) return;
    let cancelled = false;
    setLoading(true);
    setErr('');
    showInvitation(invitationId)
      .then((i) => !cancelled && setInv(i || null))
      .catch((e) => !cancelled && setErr(extractApiError(e, 'Failed to load invitation')))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; setInv(null); };
  }, [invitationId]);

  if (!invitationId) return null;
  const status = inv?.revoked_at ? 'rejected' : inv?.accepted_at ? 'active' : (inv?.expires_at && new Date(inv.expires_at) < new Date()) ? 'exception' : 'pending';

  return (
    <CvsModal
      open={!!invitationId}
      onClose={onClose}
      title={inv?.full_name || 'Invitation'}
      subtitle={inv?.email || 'Invitation details'}
      size="md"
      footer={<button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={onClose}>Close</button>}
    >
      {loading && <div style={{ color: 'var(--ts)', fontSize: 12 }}>Loading…</div>}
      {err && !loading && <div className="ntf er"><div><div className="ntf-t">Could not load invitation</div><div className="ntf-b">{err}</div></div></div>}
      {inv && !loading && (
        <div className="fg">
          <div className="fi"><label className="fl">Name</label><div style={{ fontWeight: 600 }}>{inv.full_name || '—'}</div></div>
          <div className="fi"><label className="fl">Email</label><div>{inv.email || '—'}</div></div>
          <div className="fi"><label className="fl">Role</label><div>{inv.role?.name || '—'}</div></div>
          <div className="fi"><label className="fl">Brand</label><div>{inv.brand?.name || '—'}</div></div>
          <div className="fi"><label className="fl">Shop</label><div>{inv.shop?.name || '—'}</div></div>
          <div className="fi"><label className="fl">Status</label><div><StatusTag type={status} /></div></div>
          {inv.note && (
            <div className="fi full"><label className="fl">Note</label><div style={{ fontSize: 12 }}>{inv.note}</div></div>
          )}
          {inv.expires_at && (
            <div className="fi"><label className="fl">Expires</label><div style={{ fontSize: 12, color: 'var(--ts)' }}>{new Date(inv.expires_at).toLocaleString()}</div></div>
          )}
          {inv.accepted_at && (
            <div className="fi"><label className="fl">Accepted</label><div style={{ fontSize: 12, color: 'var(--ok-t)' }}>{new Date(inv.accepted_at).toLocaleString()}</div></div>
          )}
          {inv.revoked_at && (
            <div className="fi"><label className="fl">Revoked</label><div style={{ fontSize: 12, color: 'var(--er-t)' }}>{new Date(inv.revoked_at).toLocaleString()}</div></div>
          )}
        </div>
      )}
    </CvsModal>
  );
}

/* ── Supplier Detail Modal (read-only) ──────────────────────────────────── */
export function SupplierDetailModal({ supplierId, onClose }) {
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!supplierId) return;
    let cancelled = false;
    setLoading(true);
    setErr('');
    showSupplier(supplierId)
      .then((s) => !cancelled && setSupplier(s || null))
      .catch((e) => !cancelled && setErr(extractApiError(e, 'Failed to load supplier')))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; setSupplier(null); };
  }, [supplierId]);

  if (!supplierId) return null;
  const brands = supplier?.brands || [];

  return (
    <CvsModal
      open={!!supplierId}
      onClose={onClose}
      title={supplier?.name || 'Supplier'}
      subtitle={supplier?.code ? `Code: ${supplier.code}` : 'Supplier details'}
      size="lg"
      footer={<button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={onClose}>Close</button>}
    >
      {loading && <div style={{ color: 'var(--ts)', fontSize: 12 }}>Loading…</div>}
      {err && !loading && <div className="ntf er"><div><div className="ntf-t">Could not load supplier</div><div className="ntf-b">{err}</div></div></div>}
      {supplier && !loading && (
        <>
          <div className="fg">
            <div className="fi"><label className="fl">Name</label><div style={{ fontWeight: 600 }}>{supplier.name || '—'}</div></div>
            <div className="fi"><label className="fl">Code</label><div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{supplier.code || '—'}</div></div>
            <div className="fi"><label className="fl">Scope</label><div>{supplier.scope_type || '—'}</div></div>
            <div className="fi"><label className="fl">Status</label><div><StatusTag type={supplier.status || 'pending'} /></div></div>
            <div className="fi"><label className="fl">Contact Person</label><div>{supplier.contact_person || '—'}</div></div>
            <div className="fi"><label className="fl">Phone</label><div style={{ fontFamily: "'IBM Plex Mono',monospace" }}>{supplier.phone || '—'}</div></div>
            <div className="fi"><label className="fl">Email</label><div>{supplier.email || '—'}</div></div>
            <div className="fi"><label className="fl">InnBucks</label><div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{supplier.inbucks_number || '—'}</div></div>
            <div className="fi full"><label className="fl">Address</label><div>{supplier.address || '—'}</div></div>
            {supplier.cert_expiry && (
              <div className="fi"><label className="fl">Cert Expiry</label><div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{supplier.cert_expiry}</div></div>
            )}
          </div>
          {supplier.scope_type === 'restricted' && (
            <>
              <div className="tbbar" style={{ marginTop: 20 }}>
                <div className="tbt">Brands served ({brands.length})</div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: 8 }}>
                {brands.length === 0
                  ? <span style={{ fontSize: 12, color: 'var(--ts)' }}>No brands linked.</span>
                  : brands.map((b) => <BrandChip key={b.id || b} brand={typeof b === 'string' ? b : b.name} />)
                }
              </div>
            </>
          )}
        </>
      )}
    </CvsModal>
  );
}

/* ── Product Detail Modal (read-only) ───────────────────────────────────── */
export function ProductDetailModal({ productId, onClose }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!productId) return;
    let cancelled = false;
    setLoading(true);
    setErr('');
    showProcurementProduct(productId)
      .then((p) => !cancelled && setProduct(p || null))
      .catch((e) => !cancelled && setErr(extractApiError(e, 'Failed to load product')))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; setProduct(null); };
  }, [productId]);

  if (!productId) return null;

  return (
    <CvsModal
      open={!!productId}
      onClose={onClose}
      title={product?.name || 'Product'}
      subtitle={product?.code ? `Code: ${product.code}` : 'Product details'}
      size="md"
      footer={<button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={onClose}>Close</button>}
    >
      {loading && <div style={{ color: 'var(--ts)', fontSize: 12 }}>Loading…</div>}
      {err && !loading && <div className="ntf er"><div><div className="ntf-t">Could not load product</div><div className="ntf-b">{err}</div></div></div>}
      {product && !loading && (
        <div className="fg">
          <div className="fi"><label className="fl">Name</label><div style={{ fontWeight: 600 }}>{product.name || '—'}</div></div>
          <div className="fi"><label className="fl">Code</label><div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{product.code || '—'}</div></div>
          <div className="fi"><label className="fl">Category</label><div>{product.category?.name || '—'}</div></div>
          <div className="fi"><label className="fl">Unit</label><div>{product.unit || '—'}</div></div>
          {product.description && (
            <div className="fi full"><label className="fl">Description</label><div style={{ fontSize: 12 }}>{product.description}</div></div>
          )}
          {product.created_at && (
            <div className="fi"><label className="fl">Created</label><div style={{ fontSize: 12, color: 'var(--ts)' }}>{new Date(product.created_at).toLocaleString()}</div></div>
          )}
        </div>
      )}
    </CvsModal>
  );
}

/* ── Category Detail Modal (read-only) ──────────────────────────────────── */
export function CategoryDetailModal({ categoryId, onClose }) {
  const [cat, setCat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!categoryId) return;
    let cancelled = false;
    setLoading(true);
    setErr('');
    showProcurementCategory(categoryId)
      .then((c) => !cancelled && setCat(c || null))
      .catch((e) => !cancelled && setErr(extractApiError(e, 'Failed to load category')))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; setCat(null); };
  }, [categoryId]);

  if (!categoryId) return null;

  return (
    <CvsModal
      open={!!categoryId}
      onClose={onClose}
      title={cat?.name || 'Category'}
      subtitle={cat?.code ? `Code: ${cat.code}` : 'Category details'}
      size="sm"
      footer={<button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={onClose}>Close</button>}
    >
      {loading && <div style={{ color: 'var(--ts)', fontSize: 12 }}>Loading…</div>}
      {err && !loading && <div className="ntf er"><div><div className="ntf-t">Could not load category</div><div className="ntf-b">{err}</div></div></div>}
      {cat && !loading && (
        <div className="fg">
          <div className="fi"><label className="fl">Name</label><div style={{ fontWeight: 600 }}>{cat.name || '—'}</div></div>
          <div className="fi"><label className="fl">Code</label><div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{cat.code || '—'}</div></div>
          {cat.description && (
            <div className="fi full"><label className="fl">Description</label><div style={{ fontSize: 12 }}>{cat.description}</div></div>
          )}
        </div>
      )}
    </CvsModal>
  );
}

/* ── Supplier Products Modal (list + link + update price + unlink) ──────── */
export function SupplierProductsModal({ supplier, onClose }) {
  const { addToast } = useApp();
  const [links, setLinks] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [linkProductId, setLinkProductId] = useState('');
  const [editingPrice, setEditingPrice] = useState({}); // { [linkId]: number }
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!supplier?.id) return;
    setLoading(true);
    setErr('');
    try {
      const [linkList, productList] = await Promise.all([
        listSupplierProducts(supplier.id).catch(() => []),
        listProcurementProducts().catch(() => []),
      ]);
      setLinks(Array.isArray(linkList) ? linkList : []);
      setProducts(Array.isArray(productList) ? productList : []);
    } catch (e) {
      setErr(extractApiError(e, 'Failed to load supplier products'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (supplier?.id) load();
    else { setLinks([]); setProducts([]); }
  }, [supplier?.id]);

  if (!supplier) return null;

  const linkedProductIds = new Set(links.map((l) => l.product_id || l.product?.id));
  const availableProducts = products.filter((p) => !linkedProductIds.has(p.id));

  const addLink = async () => {
    if (!linkProductId) return;
    setSaving(true);
    try {
      await linkSupplierProduct(supplier.id, linkProductId);
      addToast('ok', 'Product linked', 'Supplier can now fulfil this product');
      setLinkProductId('');
      await load();
    } catch (e) {
      addToast('er', 'Link failed', extractApiError(e));
    } finally {
      setSaving(false);
    }
  };

  const savePrice = async (link) => {
    const price = editingPrice[link.id];
    if (price == null || price === '') return;
    setSaving(true);
    try {
      await updateSupplierProduct(supplier.id, link.product_id || link.product?.id, { default_price: Number(price) });
      addToast('ok', 'Price updated', `Default price: ${price}`);
      setEditingPrice((m) => { const { [link.id]: _, ...rest } = m; return rest; });
      await load();
    } catch (e) {
      addToast('er', 'Update failed', extractApiError(e));
    } finally {
      setSaving(false);
    }
  };

  const removeLink = async (link) => {
    setSaving(true);
    try {
      await unlinkSupplierProduct(supplier.id, link.product_id || link.product?.id);
      addToast('ok', 'Product unlinked', 'Removed from supplier');
      await load();
    } catch (e) {
      addToast('er', 'Unlink failed', extractApiError(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <CvsModal
      open={!!supplier}
      onClose={onClose}
      title={`${supplier.name} — Products`}
      subtitle={`Manage the products this supplier can fulfil (${links.length})`}
      size="lg"
      footer={<button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={onClose}>Close</button>}
    >
      {err && <div className="ntf er"><div><div className="ntf-t">Could not load</div><div className="ntf-b">{err}</div></div></div>}

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <select
          className="fsel"
          style={{ flex: 1 }}
          value={linkProductId}
          onChange={(e) => setLinkProductId(e.target.value)}
          disabled={saving || availableProducts.length === 0}
        >
          <option value="">
            {availableProducts.length === 0 ? 'All products already linked' : 'Select a product to link…'}
          </option>
          {availableProducts.map((p) => (
            <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
          ))}
        </select>
        <button className="ab pri" style={{ height: 34, padding: '0 14px', fontSize: 12 }} disabled={!linkProductId || saving} onClick={addLink}>+ Link</button>
      </div>

      <table className="dt">
        <thead><tr><th>Code</th><th>Product</th><th>Unit</th><th>Default Price</th><th style={{ width: 160 }}>Action</th></tr></thead>
        <tbody>
          {loading && links.length === 0 ? (
            <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--ts)', padding: 16 }}>Loading…</td></tr>
          ) : links.length === 0 ? (
            <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--ts)', padding: 16 }}>No products linked yet.</td></tr>
          ) : links.map((l) => {
            const p = l.product || products.find((x) => x.id === l.product_id) || {};
            const editing = editingPrice[l.id] != null;
            return (
              <tr key={l.id}>
                <td><code style={{ color: 'var(--info)', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11 }}>{p.code || l.product?.code || '—'}</code></td>
                <td><strong>{p.name || l.product?.name || '—'}</strong></td>
                <td style={{ fontSize: 12, color: 'var(--ts)' }}>{p.unit || '—'}</td>
                <td>
                  {editing ? (
                    <input type="number" className="fin" style={{ height: 26, width: 100 }} value={editingPrice[l.id]} onChange={(e) => setEditingPrice((m) => ({ ...m, [l.id]: e.target.value }))} />
                  ) : (
                    <strong style={{ fontFamily: "'IBM Plex Mono',monospace" }}>{l.default_price != null ? Number(l.default_price).toFixed(2) : '—'}</strong>
                  )}
                </td>
                <td>
                  <div className="ra">
                    {editing ? (
                      <>
                        <button className="rb ap" onClick={() => savePrice(l)} disabled={saving}>Save</button>
                        <button className="rb rv" onClick={() => setEditingPrice((m) => { const { [l.id]: _, ...rest } = m; return rest; })}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button className="rb ed" onClick={() => setEditingPrice((m) => ({ ...m, [l.id]: l.default_price ?? '' }))}>Edit price</button>
                        <button className="rb rv" onClick={() => removeLink(l)} disabled={saving}>Unlink</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </CvsModal>
  );
}

/* ── Change Password Modal ──────────────────────────────────────────────── */
export function ChangePasswordModal({ open, onClose }) {
  const { addToast } = useApp();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) { setCurrent(''); setNext(''); setConfirm(''); }
  }, [open]);

  const valid = current && next.length >= 8 && next === confirm;

  const submit = async () => {
    if (!valid || saving) return;
    setSaving(true);
    try {
      await changePassword({ current_password: current, password: next, password_confirmation: confirm });
      addToast('ok', 'Password updated', 'Use your new password next time you sign in.');
      onClose?.();
    } catch (err) {
      addToast('er', 'Update failed', extractApiError(err));
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <CvsModal
      open={open}
      onClose={onClose}
      title="Change Password"
      subtitle="Enter your current password, then choose a new one"
      size="sm"
      footer={<>
        <button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={onClose}>Cancel</button>
        <button className="ab pri" style={{ height: 42, padding: '0 20px' }} disabled={!valid || saving} onClick={submit}>{saving ? 'Updating…' : 'Update password'}</button>
      </>}
    >
      <div className="fg">
        <div className="fi full"><label className="fl">Current password</label><input className="fin" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} /></div>
        <div className="fi full"><label className="fl">New password</label><input className="fin" type="password" autoComplete="new-password" minLength={8} value={next} onChange={(e) => setNext(e.target.value)} /><div className="fh">Minimum 8 characters.</div></div>
        <div className="fi full"><label className="fl">Confirm new password</label><input className="fin" type="password" autoComplete="new-password" minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          {confirm && next !== confirm && <div className="fh" style={{ color: 'var(--er-t)' }}>Passwords don't match.</div>}
        </div>
      </div>
    </CvsModal>
  );
}

/* ── Permissions Modal (read-only list) ─────────────────────────────────── */
export function PermissionsModal({ open, onClose }) {
  const [perms, setPerms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [errDetail, setErrDetail] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setErr('');
    setErrDetail('');
    listPermissions()
      .then((list) => !cancelled && setPerms(Array.isArray(list) ? list : []))
      .catch((e) => {
        if (cancelled) return;
        const status = e?.response?.status;
        if (status >= 500) {
          setErr('The permissions service is temporarily unavailable. The backend team has been notified.');
          setErrDetail(extractApiError(e, ''));
        } else {
          setErr(extractApiError(e, 'Failed to load permissions'));
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [open]);

  if (!open) return null;

  const filtered = filter
    ? perms.filter((p) => [p.name, p.code, p.description].some((v) => String(v || '').toLowerCase().includes(filter.toLowerCase())))
    : perms;

  const grouped = filtered.reduce((acc, p) => {
    const key = p.group || p.module || (p.code || '').split('.')[0] || 'Other';
    (acc[key] ||= []).push(p);
    return acc;
  }, {});

  return (
    <CvsModal
      open={open}
      onClose={onClose}
      title="System Permissions"
      subtitle={`${perms.length} permission${perms.length === 1 ? '' : 's'} defined`}
      size="lg"
      footer={<button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={onClose}>Close</button>}
    >
      {loading && <div style={{ color: 'var(--ts)', fontSize: 12 }}>Loading…</div>}
      {err && !loading && (
        <div className="ntf er">
          <div>
            <div className="ntf-t">Could not load permissions</div>
            <div className="ntf-b">{err}</div>
            {errDetail && (
              <details style={{ marginTop: 6, fontSize: 11, color: 'var(--ts)' }}>
                <summary style={{ cursor: 'pointer' }}>Technical details</summary>
                <div style={{ marginTop: 4, fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{errDetail}</div>
              </details>
            )}
          </div>
        </div>
      )}
      {!loading && !err && (
        <>
          <input className="srch" placeholder="Filter permissions…" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ marginBottom: 12, width: '100%' }} />
          {Object.keys(grouped).length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--ts)', padding: 20, fontSize: 12 }}>No permissions match.</div>
          ) : Object.entries(grouped).map(([group, items]) => (
            <div key={group} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ts)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{group}</div>
              <table className="dt">
                <thead><tr><th>Code</th><th>Name</th><th>Description</th></tr></thead>
                <tbody>
                  {items.map((p) => (
                    <tr key={p.id || p.code}>
                      <td><code style={{ color: 'var(--info)', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11 }}>{p.code || '—'}</code></td>
                      <td><strong>{p.name || '—'}</strong></td>
                      <td style={{ fontSize: 12, color: 'var(--ts)' }}>{p.description || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </>
      )}
    </CvsModal>
  );
}

/* ── Assign User Role Modal ─────────────────────────────────────────────── */
export function AssignUserRoleModal({ user, roles = [], brands = [], shops = [], onClose }) {
  const { addToast } = useApp();
  const [roleId, setRoleId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [shopId, setShopId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) { setRoleId(''); setBrandId(''); setShopId(''); }
  }, [user]);

  if (!user) return null;
  const selectedRole = roles.find((r) => r.id === roleId);
  const isGlobalRole = selectedRole?.scope_type === 'global';
  const isShopRole = selectedRole?.code === 'SHOP_MANAGER';
  const shopsInBrand = shops.filter((s) => s.brand_id === brandId);
  const valid = !!roleId && (isGlobalRole || !!brandId) && (!isShopRole || !!shopId);

  const save = async () => {
    if (!valid || saving) return;
    setSaving(true);
    try {
      const payload = { role_id: roleId };
      if (!isGlobalRole && brandId) payload.brand_id = brandId;
      if (isShopRole && shopId) payload.shop_id = shopId;
      await assignUserRole(user.id, payload);
      addToast('ok', 'Role assigned', `${selectedRole?.name || 'Role'} added to ${user.name || user.email || user.full_name}`);
      onClose?.(true);
    } catch (err) {
      addToast('er', 'Assignment failed', extractApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <CvsModal
      open={!!user}
      onClose={() => onClose?.(false)}
      title="Assign role"
      subtitle={user.name || user.email || user.full_name || 'User'}
      size="sm"
      footer={<>
        <button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={() => onClose?.(false)}>Cancel</button>
        <button className="ab pri" style={{ height: 42, padding: '0 20px' }} disabled={!valid || saving} onClick={save}>{saving ? 'Saving…' : 'Assign'}</button>
      </>}
    >
      <div className="fg">
        <div className="fi full">
          <label className="fl">Role</label>
          <select className="fsel" value={roleId} onChange={(e) => { setRoleId(e.target.value); setBrandId(''); setShopId(''); }}>
            <option value="">— Select role —</option>
            {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        {selectedRole && !isGlobalRole && (
          <div className="fi full">
            <label className="fl">Brand</label>
            <select className="fsel" value={brandId} onChange={(e) => { setBrandId(e.target.value); setShopId(''); }}>
              <option value="">— Select brand —</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        )}
        {isShopRole && brandId && (
          <div className="fi full">
            <label className="fl">Shop</label>
            <select className="fsel" value={shopId} onChange={(e) => setShopId(e.target.value)}>
              <option value="">— Select shop —</option>
              {shopsInBrand.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {shopsInBrand.length === 0 && (
              <div className="fh" style={{ color: 'var(--ts)' }}>No shops registered for this brand yet.</div>
            )}
          </div>
        )}
      </div>
      <div style={{ marginTop: 12, padding: 10, background: 'var(--info-bg)', borderLeft: '3px solid var(--int)', fontSize: 11, color: 'var(--ts)' }}>
        This adds a new role assignment to the user without touching existing ones. To replace a role, remove the old one separately.
      </div>
    </CvsModal>
  );
}

/* ── User Roles Modal — list / add / edit-scope / remove assignments ───── */
export function UserRolesModal({ user, roles = [], brands = [], shops = [], onClose }) {
  const { addToast } = useApp();
  const [busyId, setBusyId] = useState('');
  const [editing, setEditing] = useState(null);
  const [editBrandId, setEditBrandId] = useState('');
  const [editShopId, setEditShopId] = useState('');

  const [newRoleId, setNewRoleId] = useState('');
  const [newBrandId, setNewBrandId] = useState('');
  const [newShopId, setNewShopId] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (user) {
      setNewRoleId(''); setNewBrandId(''); setNewShopId('');
      setEditing(null);
    }
  }, [user]);
  if (!user) return null;

  const assignments = user.raw?.assignments || user.assignments || [];
  const roleById = Object.fromEntries(roles.map((r) => [r.id, r]));
  const brandById = Object.fromEntries(brands.map((b) => [b.id, b]));
  const shopById = Object.fromEntries(shops.map((s) => [s.id, s]));
  const userId = user.id;

  const newRole = roles.find((r) => r.id === newRoleId);
  const newIsGlobal = newRole?.scope_type === 'global';
  const newIsShop = newRole?.code === 'SHOP_MANAGER';
  const shopsInNewBrand = shops.filter((s) => s.brand_id === newBrandId);
  const newValid = !!newRoleId && (newIsGlobal || !!newBrandId) && (!newIsShop || !!newShopId);

  const handleRemove = async (assignment) => {
    if (!window.confirm(`Remove ${roleById[assignment.role_id]?.name || 'this role'} assignment?`)) return;
    setBusyId(assignment.id);
    try {
      await removeUserRoleAssignment(userId, assignment.id);
      addToast('ok', 'Assignment removed', 'The role has been revoked');
      onClose?.(true);
    } catch (e) {
      addToast('er', 'Remove failed', extractApiError(e));
    } finally {
      setBusyId('');
    }
  };

  const startEdit = (a) => {
    setEditing(a.id);
    setEditBrandId(a.brand_id || '');
    setEditShopId(a.shop_id || '');
  };

  const saveEdit = async (a) => {
    setBusyId(a.id);
    try {
      const payload = { role_id: a.role_id };
      if (editBrandId) payload.brand_id = editBrandId;
      if (editShopId) payload.shop_id = editShopId;
      await updateUserRoleAssignment(userId, a.id, payload);
      addToast('ok', 'Scope updated', 'Assignment scope saved');
      onClose?.(true);
    } catch (e) {
      addToast('er', 'Update failed', extractApiError(e));
    } finally {
      setBusyId('');
      setEditing(null);
    }
  };

  const handleAdd = async () => {
    if (!newValid || adding) return;
    setAdding(true);
    try {
      const payload = { role_id: newRoleId };
      if (!newIsGlobal && newBrandId) payload.brand_id = newBrandId;
      if (newIsShop && newShopId) payload.shop_id = newShopId;
      await assignUserRole(userId, payload);
      addToast('ok', 'Role assigned', `${newRole?.name || 'Role'} added`);
      onClose?.(true);
    } catch (e) {
      addToast('er', 'Assignment failed', extractApiError(e));
    } finally {
      setAdding(false);
    }
  };

  return (
    <CvsModal
      open={!!user}
      onClose={() => onClose?.(false)}
      title="Manage roles"
      subtitle={user.name || user.email || 'User'}
      size="md"
      footer={<button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={() => onClose?.(false)}>Done</button>}
    >
      <div style={{ marginBottom: 14 }}>
        <div className="cvs-detail-label" style={{ marginBottom: 6 }}>Current assignments ({assignments.length})</div>
        {assignments.length === 0 ? (
          <div style={{ fontSize: 12, color: 'var(--ts)', padding: 8, background: 'var(--l2)' }}>No assignments yet — add one below.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {assignments.map((a) => {
              const role = roleById[a.role_id];
              const brand = brandById[a.brand_id];
              const shop = shopById[a.shop_id];
              const isEditing = editing === a.id;
              const isShop = role?.code === 'SHOP_MANAGER';
              const isGlobal = role?.scope_type === 'global';
              const editShopsInBrand = shops.filter((s) => s.brand_id === editBrandId);
              return (
                <div key={a.id} style={{ border: '1px solid var(--bs)', padding: 10, background: a.is_active === false ? 'var(--l2)' : 'var(--l1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{role?.name || a.role_id}</div>
                      <div style={{ fontSize: 11, color: 'var(--ts)', fontFamily: "'IBM Plex Mono',monospace" }}>
                        {role?.code || ''}{role?.scope_type ? ` · ${role.scope_type}` : ''}
                        {brand ? ` · ${brand.name}` : ''}{shop ? ` / ${shop.name}` : ''}
                      </div>
                    </div>
                    {!isEditing && (
                      <div className="ra">
                        {!isGlobal && (
                          <button className="rb ed" disabled={busyId === a.id} onClick={() => startEdit(a)}>Edit scope</button>
                        )}
                        <button className="rb rj" disabled={busyId === a.id} onClick={() => handleRemove(a)}>{busyId === a.id ? '…' : 'Remove'}</button>
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, marginTop: 10 }}>
                      <select className="fsel" value={editBrandId} onChange={(e) => { setEditBrandId(e.target.value); setEditShopId(''); }}>
                        <option value="">— Brand —</option>
                        {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                      {isShop && (
                        <select className="fsel" value={editShopId} onChange={(e) => setEditShopId(e.target.value)}>
                          <option value="">— Shop —</option>
                          {editShopsInBrand.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      )}
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="rb ap" disabled={busyId === a.id} onClick={() => saveEdit(a)}>{busyId === a.id ? '…' : 'Save'}</button>
                        <button className="rb sec" onClick={() => setEditing(null)}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px solid var(--bs)', paddingTop: 14 }}>
        <div className="cvs-detail-label" style={{ marginBottom: 6 }}>Add a new role</div>
        <div className="fg">
          <div className="fi full">
            <label className="fl">Role</label>
            <select className="fsel" value={newRoleId} onChange={(e) => { setNewRoleId(e.target.value); setNewBrandId(''); setNewShopId(''); }}>
              <option value="">— Select role —</option>
              {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          {newRole && !newIsGlobal && (
            <div className="fi full">
              <label className="fl">Brand</label>
              <select className="fsel" value={newBrandId} onChange={(e) => { setNewBrandId(e.target.value); setNewShopId(''); }}>
                <option value="">— Select brand —</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          )}
          {newIsShop && newBrandId && (
            <div className="fi full">
              <label className="fl">Shop</label>
              <select className="fsel" value={newShopId} onChange={(e) => setNewShopId(e.target.value)}>
                <option value="">— Select shop —</option>
                {shopsInNewBrand.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}
        </div>
        <button className="ab pri" style={{ height: 36, marginTop: 10 }} disabled={!newValid || adding} onClick={handleAdd}>{adding ? 'Adding…' : '+ Add assignment'}</button>
      </div>
    </CvsModal>
  );
}

/* ── Role Edit Modal — create or rename a role ──────────────────────────── */
const SCOPE_OPTIONS = [
  { value: 'global', label: 'Global (no brand/shop)' },
  { value: 'brand', label: 'Brand-scoped' },
  { value: 'shop', label: 'Shop-scoped' },
];

export function RoleEditModal({ role, onClose }) {
  const { addToast } = useApp();
  const isCreate = !role?.id;
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [scopeType, setScopeType] = useState('brand');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [refetching, setRefetching] = useState(false);

  useEffect(() => {
    if (!role) return;
    // Prime form from the row immediately for instant render.
    setName(role.name || '');
    setCode(role.code || '');
    setScopeType(role.scope_type || 'brand');
    setDescription(role.description || '');
    // For edits, refetch from /roles/:id to pick up any fields not in the
    // listRoles payload (e.g. description). Skipped for create.
    if (role.id) {
      let cancelled = false;
      setRefetching(true);
      showRole(role.id)
        .then((res) => {
          if (cancelled) return;
          const fresh = res?.data || res;
          if (fresh?.name) setName(fresh.name);
          if (fresh?.code) setCode(fresh.code);
          if (fresh?.scope_type) setScopeType(fresh.scope_type);
          if (fresh?.description != null) setDescription(fresh.description || '');
        })
        .catch(() => { /* fall back to row data */ })
        .finally(() => !cancelled && setRefetching(false));
      return () => { cancelled = true; };
    }
  }, [role]);

  if (!role) return null;
  const valid = name.trim() && code.trim() && scopeType;

  const save = async () => {
    if (!valid || saving) return;
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        scope_type: scopeType,
        description: description.trim() || null,
      };
      if (isCreate) {
        await createRole(payload);
        addToast('ok', 'Role created', payload.name);
      } else {
        await updateRole(role.id, payload);
        addToast('ok', 'Role updated', payload.name);
      }
      onClose?.(true);
    } catch (e) {
      addToast('er', isCreate ? 'Create failed' : 'Update failed', extractApiError(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <CvsModal
      open={!!role}
      onClose={() => onClose?.(false)}
      title={isCreate ? 'New role' : 'Edit role'}
      subtitle={isCreate ? 'Create a role definition' : (refetching ? 'Refreshing…' : (role.name || 'Role'))}
      size="md"
      footer={<>
        <button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={() => onClose?.(false)}>Cancel</button>
        <button className="ab pri" style={{ height: 42, padding: '0 20px' }} disabled={!valid || saving} onClick={save}>{saving ? 'Saving…' : (isCreate ? 'Create role' : 'Save changes')}</button>
      </>}
    >
      <div className="fg">
        <div className="fi"><label className="fl">Display name</label><input className="fin" value={name} onChange={(e) => setName(e.target.value)} placeholder="Brand Manager" /></div>
        <div className="fi">
          <label className="fl">Code</label>
          <input className="fin" value={code} onChange={(e) => setCode(e.target.value)} placeholder="BRAND_MANAGER" style={{ fontFamily: "'IBM Plex Mono',monospace" }} />
          <div className="fh">UPPERCASE_SNAKE — used in permission checks</div>
        </div>
        <div className="fi">
          <label className="fl">Scope</label>
          <select className="fsel" value={scopeType} onChange={(e) => setScopeType(e.target.value)}>
            {SCOPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="fi full">
          <label className="fl">Description</label>
          <input className="fin" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional — what this role can do" />
        </div>
      </div>
      {!isCreate && (
        <div style={{ marginTop: 12, padding: 10, background: 'var(--info-bg)', borderLeft: '3px solid var(--int)', fontSize: 11, color: 'var(--ts)' }}>
          Permissions are managed separately via the "Edit perms" button on the role list.
        </div>
      )}
    </CvsModal>
  );
}

/* ── Role Permissions Modal ─────────────────────────────────────────────── */
export function RolePermissionsModal({ role, onClose }) {
  const { addToast } = useApp();
  const [allPerms, setAllPerms] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [errDetail, setErrDetail] = useState('');
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!role) return;
    let cancelled = false;
    setLoading(true);
    setErr('');
    setErrDetail('');
    setSelectedIds((role.permissions || []).map((p) => p.id).filter(Boolean));
    listPermissions()
      .then((list) => !cancelled && setAllPerms(Array.isArray(list) ? list : []))
      .catch((e) => {
        if (cancelled) return;
        const status = e?.response?.status;
        if (status >= 500) {
          setErr('The permissions service is temporarily unavailable. The backend team has been notified.');
          setErrDetail(extractApiError(e, ''));
        } else {
          setErr(extractApiError(e, 'Failed to load permissions'));
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [role]);

  if (!role) return null;

  const toggle = (id) =>
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  const filtered = filter
    ? allPerms.filter((p) => [p.name, p.code, p.description].some((v) => String(v || '').toLowerCase().includes(filter.toLowerCase())))
    : allPerms;
  const grouped = filtered.reduce((acc, p) => {
    const key = p.group || p.module || (p.code || '').split('.')[0] || 'Other';
    (acc[key] ||= []).push(p);
    return acc;
  }, {});

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await syncRolePermissions(role.id, selectedIds);
      addToast('ok', 'Permissions updated', `${role.name || 'Role'} now has ${selectedIds.length} permission${selectedIds.length === 1 ? '' : 's'}`);
      onClose?.(true);
    } catch (e) {
      addToast('er', 'Save failed', extractApiError(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <CvsModal
      open={!!role}
      onClose={() => onClose?.(false)}
      title={`Permissions — ${role.name || 'Role'}`}
      subtitle={role.code ? `${role.code} · ${selectedIds.length} selected` : `${selectedIds.length} selected`}
      size="lg"
      footer={<>
        <button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={() => onClose?.(false)}>Cancel</button>
        <button className="ab pri" style={{ height: 42, padding: '0 20px' }} disabled={saving || !!err} onClick={save}>{saving ? 'Saving…' : 'Save permissions'}</button>
      </>}
    >
      {loading && <div style={{ color: 'var(--ts)', fontSize: 12 }}>Loading…</div>}
      {err && !loading && (
        <div className="ntf er">
          <div>
            <div className="ntf-t">Could not load permissions</div>
            <div className="ntf-b">{err}</div>
            {errDetail && (
              <details style={{ marginTop: 6, fontSize: 11, color: 'var(--ts)' }}>
                <summary style={{ cursor: 'pointer' }}>Technical details</summary>
                <div style={{ marginTop: 4, fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{errDetail}</div>
              </details>
            )}
          </div>
        </div>
      )}
      {!loading && !err && (
        <>
          <input className="srch" placeholder="Filter permissions…" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ marginBottom: 12, width: '100%' }} />
          {Object.keys(grouped).length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--ts)', padding: 20, fontSize: 12 }}>No permissions match.</div>
          ) : Object.entries(grouped).map(([group, items]) => (
            <div key={group} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ts)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                <span>{group}</span>
                <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 400 }}>
                  {items.filter((p) => selectedIds.includes(p.id)).length}/{items.length}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4 }}>
                {items.map((p) => {
                  const on = selectedIds.includes(p.id);
                  return (
                    <label key={p.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 8px', fontSize: 12, cursor: 'pointer', background: on ? 'var(--info-bg)' : 'transparent', border: '1px solid var(--bs)' }}>
                      <input type="checkbox" checked={on} onChange={() => toggle(p.id)} style={{ marginTop: 2 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600 }}>{p.name || p.code}</div>
                        <div style={{ fontSize: 10, color: 'var(--ts)', fontFamily: "'IBM Plex Mono',monospace", wordBreak: 'break-word' }}>{p.code}</div>
                        {p.description && <div style={{ fontSize: 10, color: 'var(--ts)', marginTop: 2 }}>{p.description}</div>}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      )}
    </CvsModal>
  );
}

/* ── New / Edit Supplier Modal ──────────────────────────────────────────── */
const emptySupplier = {
  name: '', code: '', scope_type: 'global',
  contact_person: '', phone: '', email: '',
  address: '', inbucks_number: '', cert_expiry: '',
};

export function NewSupplierModal({ open, supplier = null, onClose }) {
  const { addToast } = useApp();
  const editing = !!supplier?.id;
  const isOpen = editing ? !!supplier : !!open;
  const [form, setForm] = useState(emptySupplier);
  const [saving, setSaving] = useState(false);
  const [brands, setBrands] = useState([]);
  const [brandIds, setBrandIds] = useState([]);
  const initialBrandIds = (supplier?.brands || [])
    .map((b) => (typeof b === 'string' ? b : b?.id))
    .filter(Boolean);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    listBrands()
      .then((list) => !cancelled && setBrands(Array.isArray(list) ? list : []))
      .catch(() => !cancelled && setBrands([]));
    return () => { cancelled = true; };
  }, [isOpen]);

  useEffect(() => {
    if (editing) {
      setForm({
        name: supplier.name || '',
        code: supplier.code || '',
        scope_type: supplier.scope_type || 'global',
        contact_person: supplier.contact_person || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
        inbucks_number: supplier.inbucks_number || '',
        cert_expiry: supplier.cert_expiry || '',
      });
      setBrandIds(initialBrandIds);
    } else if (isOpen) {
      setForm(emptySupplier);
      setBrandIds([]);
    }
  }, [supplier, editing, isOpen]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.name.trim().length > 0;
  const toggleBrand = (id) =>
    setBrandIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  const close = (changed) => {
    onClose?.(changed);
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim() || null,
        scope_type: form.scope_type,
        contact_person: form.contact_person.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim() || null,
        inbucks_number: form.inbucks_number.trim() || null,
        cert_expiry: form.cert_expiry || null,
      };
      if (form.scope_type === 'restricted') payload.brand_ids = brandIds;
      let id;
      if (editing) {
        await updateSupplier(supplier.id, payload);
        id = supplier.id;
        addToast('ok', 'Supplier updated', payload.name);
      } else {
        const created = await createSupplier(payload);
        id = created?.id || created?.data?.id;
        addToast('ok', 'Supplier registered', `${payload.name} — awaiting verification`);
      }
      // For edits, explicitly sync the pivot — handles the case where scope
      // flipped from restricted → global (clears brands) or vice versa.
      if (editing && id) {
        await syncSupplierBrands(id, form.scope_type === 'restricted' ? brandIds : []);
      }
      close(true);
    } catch (err) {
      addToast('er', 'Save failed', extractApiError(err));
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <CvsModal
      open={isOpen}
      onClose={() => close(false)}
      title={editing ? 'Edit Supplier' : 'Register New Supplier'}
      subtitle={editing ? supplier.name : 'New suppliers are reviewed by Procurement before activation'}
      footer={<>
        <button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={() => close(false)}>Cancel</button>
        <button className="ab pri" style={{ height: 42, padding: '0 20px' }} disabled={!valid || saving} onClick={save}>
          {saving ? 'Saving…' : editing ? 'Save Changes' : 'Submit for Review'}
        </button>
      </>}
    >
      <div className="fg">
        <div className="fi"><label className="fl">Supplier Name</label><input className="fin" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Company legal name" /></div>
        <div className="fi"><label className="fl">Code</label><input className="fin" value={form.code} onChange={(e) => set('code', e.target.value)} placeholder="e.g. SUP-001" /></div>
        <div className="fi">
          <label className="fl">Scope</label>
          <select className="fsel" value={form.scope_type} onChange={(e) => set('scope_type', e.target.value)}>
            <option value="global">Global (all brands)</option>
            <option value="restricted">Restricted (specific brands)</option>
          </select>
        </div>
        <div className="fi"><label className="fl">InnBucks Wallet Number</label><input className="fin" value={form.inbucks_number} onChange={(e) => set('inbucks_number', e.target.value)} placeholder="IB-XXXX-XXXX" /></div>
        <div className="fi"><label className="fl">Contact Person</label><input className="fin" value={form.contact_person} onChange={(e) => set('contact_person', e.target.value)} placeholder="Full name" /></div>
        <div className="fi"><label className="fl">Contact Phone</label><input className="fin" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+263 7X XXX XXXX" /></div>
        <div className="fi"><label className="fl">Email</label><input className="fin" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="supplier@example.com" /></div>
        <div className="fi"><label className="fl">Certification Expiry</label><input className="fin" type="date" value={form.cert_expiry} onChange={(e) => set('cert_expiry', e.target.value)} /></div>
        <div className="fi full"><label className="fl">Business Address</label><input className="fin" value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Street address, City" /></div>
      </div>
      {form.scope_type === 'restricted' && (
        <div style={{ marginTop: 14 }}>
          <label className="fl">Brands this supplier serves</label>
          {brands.length === 0 ? (
            <div style={{ fontSize: 11, color: 'var(--ts)', padding: 8 }}>Loading brands…</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginTop: 6 }}>
              {brands.map((b) => (
                <label key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer', padding: '4px 6px', background: brandIds.includes(b.id) ? 'var(--info-bg)' : 'transparent', border: '1px solid var(--bs)' }}>
                  <input type="checkbox" checked={brandIds.includes(b.id)} onChange={() => toggleBrand(b.id)} />
                  <span style={{ fontWeight: 600 }}>{b.name}</span>
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'var(--ts)' }}>{b.code}</span>
                </label>
              ))}
            </div>
          )}
          <div className="fh" style={{ marginTop: 4, fontSize: 11, color: 'var(--ts)' }}>Restricted suppliers only serve the brands selected here.</div>
        </div>
      )}
      {!editing && (
        <div style={{ marginTop: 11, padding: 10, background: 'var(--info-bg)', borderLeft: '3px solid var(--int)' }}>
          <div style={{ fontSize: 11, color: 'var(--info)' }}>Procurement will verify supplier credentials and activate within 24–48 hours.</div>
        </div>
      )}
    </CvsModal>
  );
}

/* ── Pay Modal ──────────────────────────────────────────────────────────── */
export function PayModal({ open, onClose, request }) {
  const { addToast } = useApp();
  const r = request || { mgr: '', id: '', wallet: '', amt: '', supplier: '', shop: '' };
  return (
    <CvsModal open={!!open} onClose={onClose} title="Approve & Pay via InnBucks" subtitle={[r.id, r.mgr, r.shop].filter(Boolean).join(' · ')}
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
  const defaultRows = [];
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
          {displayRows.length === 0 ? (
            <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--ts)', padding: 20 }}>No data.</td></tr>
          ) : displayRows.map(r => (
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
  const [adjustedAmt, setAdjustedAmt] = useState(request?.rawAmt || 0);
  const [notes, setNotes] = useState('');
  const r = request || { id: '', mgr: '', supplier: '', rawAmt: 0, budgetStatus: '' };
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
    <CvsModal open={!!open} onClose={onClose} title="Request Exception Approval" subtitle="Over monthly threshold"
      footer={<>
        <button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={onClose}>Cancel</button>
        <button className="ab pri" style={{ height: 42, padding: '0 20px' }} disabled={!reason.trim()}
          onClick={() => { onClose(); addToast('wa', 'Exception request submitted', 'Awaiting Brand Manager approval'); setReason(''); }}>
          Submit Exception Request
        </button>
      </>}
    >
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
    <CvsModal open={!!open} onClose={onClose} title="Approve Exception" subtitle="Threshold override"
      footer={<>
        <button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={onClose}>Cancel</button>
        <button className="ab dan" style={{ height: 42, padding: '0 20px' }} onClick={() => { onClose(); addToast('er', 'Exception rejected', 'Exception request has been rejected'); }}>Reject Exception</button>
        <button style={{ background: 'var(--pur)', borderColor: 'var(--pur)', color: '#fff', height: 42, padding: '0 20px', fontSize: 13, border: '1px solid', cursor: 'pointer', fontFamily: "'IBM Plex Sans',sans-serif" }}
          onClick={() => { onClose(); addToast('ok', 'Exception approved and paid', 'Disbursed via InnBucks'); setNotes(''); }}>
          Approve Exception &amp; Pay
        </button>
      </>}
    >
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
  const data = formData || { brand: '', shop: '', supplier: '', category: '', amount: '0.00' };
  return (
    <CvsModal open={!!open} onClose={onClose} title="Review & Submit Request"
      footer={<>
        <button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={onClose}>Back</button>
        <button className="ab pri" style={{ height: 42, padding: '0 20px' }} onClick={() => { onClose(); addToast('ok', 'Request submitted', 'Sent to Brand Accountant for review'); }}>
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
    </CvsModal>
  );
}

/* ── Budget Modal (Accountant) ──────────────────────────────────────────── */
// One row per shop. Pre-existing /budgets entries appear with their amount;
// shops without a budget show 0 and an empty budget_id so the save flow knows
// to POST instead of PUT. Clearing the input back to 0 (when a budget exists)
// triggers a DELETE.
export function BudgetModal({ open, onClose, shops = [], budgets = [] }) {
  const { addToast } = useApp();
  const [rows, setRows] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const budgetByShop = Object.fromEntries(budgets.map((b) => [b.shop_id, b]));
    setRows(
      shops.map((s) => {
        const b = budgetByShop[s.id];
        const amt = Number(b?.amount ?? b?.monthly_amount ?? 0);
        return {
          shop_id: s.id,
          shop_name: s.name,
          location: s.location || '—',
          budget_id: b?.id || null,
          original_amount: amt,
          amount: amt,
        };
      })
    );
  }, [open, shops, budgets]);

  const update = (shop_id, field, val) =>
    setRows((rs) => rs.map((r) => (r.shop_id === shop_id ? { ...r, [field]: val } : r)));

  const dirtyRows = rows.filter((r) => Number(r.amount) !== Number(r.original_amount));

  const save = async () => {
    if (saving || dirtyRows.length === 0) {
      onClose?.(false);
      return;
    }
    setSaving(true);
    let ok = 0; let fail = 0;
    for (const r of dirtyRows) {
      const newAmount = Number(r.amount);
      try {
        if (r.budget_id && newAmount === 0) {
          await deleteBudget(r.budget_id);
        } else if (r.budget_id) {
          await updateBudget(r.budget_id, { amount: newAmount });
        } else if (newAmount > 0) {
          await createBudget({ shop_id: r.shop_id, amount: newAmount });
        } else {
          continue; // 0 → 0 with no existing budget; nothing to do
        }
        ok += 1;
      } catch (e) {
        fail += 1;
        addToast('er', `Save failed — ${r.shop_name}`, extractApiError(e));
      }
    }
    setSaving(false);
    if (ok > 0) addToast('ok', 'Budgets updated', `${ok} shop${ok === 1 ? '' : 's'} saved${fail ? `, ${fail} failed` : ''}`);
    onClose?.(ok > 0);
  };

  return (
    <CvsModal open={!!open} onClose={() => onClose?.(false)} size="lg" title="Set Shop Budgets" subtitle="Set monthly petty cash limits per shop"
      footer={<>
        <button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={() => onClose?.(false)}>Cancel</button>
        <button className="ab pri" style={{ height: 42, padding: '0 20px' }} disabled={saving || dirtyRows.length === 0} onClick={save}>
          {saving ? 'Saving…' : dirtyRows.length === 0 ? 'Save Budgets' : `Save ${dirtyRows.length} change${dirtyRows.length === 1 ? '' : 's'}`}
        </button>
      </>}
    >
      <table className="dt">
        <thead><tr><th>Shop</th><th>Location</th><th>Current Budget</th><th>New Monthly Budget (USD)</th><th>Status</th></tr></thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--ts)', padding: 20 }}>No shops in scope.</td></tr>
          ) : rows.map(r => {
            const isNew = !r.budget_id;
            const dirty = Number(r.amount) !== Number(r.original_amount);
            const willDelete = r.budget_id && Number(r.amount) === 0;
            return (
              <tr key={r.shop_id}>
                <td><strong>{r.shop_name}</strong></td>
                <td>{r.location}</td>
                <td>{r.budget_id ? `$${r.original_amount.toLocaleString()}` : <span style={{ color: 'var(--ts)' }}>—</span>}</td>
                <td><input className="fin" type="number" min="0" value={r.amount} onChange={e => update(r.shop_id, 'amount', e.target.value)} style={{ width: 120 }} /></td>
                <td style={{ fontSize: 11, fontFamily: "'IBM Plex Mono',monospace" }}>
                  {!dirty ? <span style={{ color: 'var(--ts)' }}>—</span>
                    : willDelete ? <span style={{ color: 'var(--er)' }}>WILL DELETE</span>
                    : isNew ? <span style={{ color: 'var(--ok-t)' }}>NEW</span>
                    : <span style={{ color: 'var(--wa-t)' }}>UPDATED</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ marginTop: 13, padding: 10, background: 'var(--info-bg)', borderLeft: '3px solid var(--int)' }}>
        <div style={{ fontSize: 11, color: 'var(--info)' }}>Set a value &gt; 0 to create or update a budget. Set to 0 to delete an existing budget. Saves run sequentially — failures are reported per shop.</div>
      </div>
    </CvsModal>
  );
}

/* ── Invite User Modal (Admin) ──────────────────────────────────────────── */
const emptyInvite = { name: '', email: '', role_id: '', brand_id: '', budget: '', note: '' };

export function InviteUserModal({ open, onClose }) {
  const { addToast } = useApp();
  const [form, setForm] = useState(emptyInvite);
  const [roles, setRoles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [metaError, setMetaError] = useState('');
  const [sending, setSending] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.name.trim() && form.email.includes('@') && form.role_id;
  const selectedRole = roles.find((r) => r.id === form.role_id);
  const isShopRole = selectedRole?.code === 'SHOP_MANAGER';
  const isGlobalRole = selectedRole?.scope_type === 'global';

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoadingMeta(true);
    setMetaError('');
    Promise.all([listRoles(), listBrands().catch(() => [])])
      .then(([roleList, brandList]) => {
        if (cancelled) return;
        setRoles(roleList || []);
        setBrands(brandList || []);
      })
      .catch((err) => {
        if (cancelled) return;
        setMetaError(err?.response?.data?.message || err.message || 'Failed to load roles.');
      })
      .finally(() => !cancelled && setLoadingMeta(false));
    return () => {
      cancelled = true;
    };
  }, [open]);

  const close = () => {
    onClose();
    setForm(emptyInvite);
  };

  const handleSend = async () => {
    if (!valid || sending) return;
    setSending(true);
    try {
      const payload = {
        full_name: form.name.trim(),
        email: form.email.trim(),
        role_id: form.role_id,
      };
      if (!isGlobalRole && form.brand_id) payload.brand_id = form.brand_id;
      if (isShopRole && form.budget) payload.monthly_budget_limit = Number(form.budget);
      if (form.note.trim()) payload.note = form.note.trim();

      await inviteUser(payload);
      addToast('ok', 'Invitation sent', `${selectedRole?.name || 'User'} invite emailed to ${form.email}`);
      close();
    } catch (err) {
      const data = err?.response?.data;
      const fieldErrors = data?.errors
        ? Object.entries(data.errors)
            .map(([k, v]) => `${k}: ${(Array.isArray(v) ? v[0] : v)}`)
            .join(' · ')
        : '';
      const msg = fieldErrors || data?.message || err.message || 'Could not send invitation';
      console.error('[invite] failed', err);
      addToast('er', 'Send failed', msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <CvsModal
      open={!!open}
      onClose={close}
      title="Invite New User"
      subtitle="Send email invitation with role and brand access"
      footer={
        <>
          <button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={close}>Cancel</button>
          <button
            className="ab pri"
            style={{ height: 42, padding: '0 20px' }}
            disabled={!valid || sending || loadingMeta}
            onClick={handleSend}
          >
            {sending ? 'Sending…' : 'Send Invitation'}
          </button>
        </>
      }
    >
      <div className="fg">
        <div className="fi">
          <label className="fl">Full Name</label>
          <input className="fin" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="First Last" />
        </div>
        <div className="fi">
          <label className="fl">Email Address</label>
          <input className="fin" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="name@simbisa.co.zw" />
        </div>
        <div className="fi">
          <label className="fl">Role</label>
          <select className="fsel" value={form.role_id} onChange={(e) => set('role_id', e.target.value)} disabled={loadingMeta || !!metaError}>
            <option value="">{loadingMeta ? 'Loading roles…' : 'Select a role'}</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
        {!isGlobalRole && selectedRole && (
          <div className="fi">
            <label className="fl">Brand</label>
            <select className="fsel" value={form.brand_id} onChange={(e) => set('brand_id', e.target.value)}>
              <option value="">— Any / none —</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}
        {isShopRole && (
          <div className="fi">
            <label className="fl">Monthly Budget Limit</label>
            <input className="fin" type="number" min="0" value={form.budget} onChange={(e) => set('budget', e.target.value)} placeholder="e.g. 800" />
            <div className="fh">Set the monthly petty cash budget for this shop</div>
          </div>
        )}
        <div className="fi full">
          <label className="fl">Note to User (in invite email)</label>
          <input className="fin" type="text" value={form.note} onChange={(e) => set('note', e.target.value)} placeholder="Welcome to CVS. Click the link to set your password." />
        </div>
      </div>
      {metaError && (
        <div style={{ marginTop: 8, fontSize: 11, color: 'var(--er-t)', fontFamily: "'IBM Plex Mono',monospace" }}>
          Failed to load roles: {metaError}
        </div>
      )}
      {!metaError && !valid && form.name && (
        <div style={{ marginTop: 8, fontSize: 11, color: 'var(--er-t)', fontFamily: "'IBM Plex Mono',monospace" }}>
          Enter a valid email and select a role.
        </div>
      )}
    </CvsModal>
  );
}

/* ── Statement Modal ────────────────────────────────────────────────────── */
export function StatementModal({ open, onClose }) {
  const { addToast } = useApp();
  const [filters, setFilters] = useState({ brand: 'All Brands', shop: 'All Shops', from: '', to: '', status: 'All', currency: 'USD' });
  const setF = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  const allRows = [];
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
            <option>All Shops</option>
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

/* ── Profile Modal ──────────────────────────────────────────────────── */
export function ProfileModal({ open, onClose }) {
  const { session, addToast } = useApp();
  if (!session) return null;
  const [form, setForm] = useState({ name: session.name, email: session.email || '', phone: session.phone || '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <CvsModal open={!!open} onClose={onClose} title="My Profile" subtitle="View and edit your account details"
      footer={<>
        <button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={onClose}>Cancel</button>
        <button className="ab pri" style={{ height: 42, padding: '0 20px' }} onClick={() => { onClose(); addToast('ok', 'Profile updated', 'Your account details have been saved'); }}>
          Save Changes
        </button>
      </>}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18, padding: 14, background: 'var(--l2)', border: '1px solid var(--bs)' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: session.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
          {session.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--tp)' }}>{session.name}</div>
          <div style={{ fontSize: 12, color: 'var(--ts)', fontFamily: "'IBM Plex Mono',monospace" }}>{session.roleLabel || session.roleKey}</div>
          <div style={{ fontSize: 11, color: 'var(--int)', marginTop: 2 }}>{session.brand}</div>
        </div>
      </div>
      <div className="fg">
        <div className="fi"><label className="fl">Full Name</label><input className="fin" value={form.name} onChange={e => set('name', e.target.value)} /></div>
        <div className="fi"><label className="fl">Email Address</label><input className="fin" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder={session.email || 'No email on file'} /></div>
        <div className="fi"><label className="fl">Phone Number</label><input className="fin" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder={session.phone || 'No phone on file'} /></div>
      </div>
    </CvsModal>
  );
}

/* ── Reject Supplier Modal ──────────────────────────────────────────────── */
export function RejectSupplierModal({ supplier, onClose }) {
  const { addToast } = useApp();
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (supplier) setReason(''); }, [supplier]);
  if (!supplier) return null;

  const submit = async () => {
    setSaving(true);
    try {
      await rejectSupplier(supplier.id, reason.trim());
      addToast('ok', 'Supplier rejected', supplier.name);
      onClose(true);
    } catch (err) {
      addToast('er', 'Reject failed', extractApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <CvsModal
      open={!!supplier}
      onClose={() => onClose(false)}
      title="Reject Supplier"
      subtitle={supplier.name}
      footer={<>
        <button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={() => onClose(false)}>Cancel</button>
        <button className="ab dan" style={{ height: 42, padding: '0 20px' }} disabled={saving || !reason.trim()} onClick={submit}>{saving ? 'Rejecting…' : 'Confirm Rejection'}</button>
      </>}
    >
      <div style={{ marginBottom: 13, padding: 10, background: 'var(--er-bg)', borderLeft: '3px solid var(--er)' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--er-t)', marginBottom: 3 }}>The supplier will be marked rejected</div>
        <div style={{ fontSize: 12, color: 'var(--ts)' }}>They will be notified by email and won't appear as a verified option to managers.</div>
      </div>
      <label className="fl">Rejection Reason (required)</label>
      <textarea className="fin" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Failed compliance check, missing certifications" style={{ resize: 'vertical', minHeight: 80 }} />
    </CvsModal>
  );
}

/* ── Suspend Supplier Modal ─────────────────────────────────────────────── */
export function SuspendSupplierModal({ supplier, onClose }) {
  const { addToast } = useApp();
  const [saving, setSaving] = useState(false);
  if (!supplier) return null;

  const submit = async () => {
    setSaving(true);
    try {
      await suspendSupplier(supplier.id);
      addToast('ok', 'Supplier suspended', supplier.name);
      onClose(true);
    } catch (err) {
      addToast('er', 'Suspend failed', extractApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <CvsModal
      open={!!supplier}
      onClose={() => onClose(false)}
      title="Suspend Supplier"
      subtitle={supplier.name}
      footer={<>
        <button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={() => onClose(false)}>Cancel</button>
        <button className="ab dan" style={{ height: 42, padding: '0 20px' }} disabled={saving} onClick={submit}>{saving ? 'Suspending…' : 'Suspend Supplier'}</button>
      </>}
    >
      <div style={{ padding: 10, background: 'var(--wa-bg)', borderLeft: '3px solid var(--wa)', marginBottom: 13 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--wa-t)', marginBottom: 3 }}>Pause activity for this supplier</div>
        <div style={{ fontSize: 12, color: 'var(--ts)' }}>The supplier will be hidden from new requests until reactivated. Existing requests are unaffected.</div>
      </div>
      <div className="cvs-detail-row"><span className="cvs-detail-label">Status</span><span>{supplier.status || '—'}</span></div>
      <div className="cvs-detail-row" style={{ borderBottom: 'none' }}><span className="cvs-detail-label">Code</span><span>{supplier.code || '—'}</span></div>
    </CvsModal>
  );
}

/* ── Generic Confirm Delete Modal ───────────────────────────────────────── */
export function ConfirmDeleteModal({ open, title, subtitle, message, confirmLabel = 'Delete', onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);
  if (!open) return null;
  const run = async () => {
    setBusy(true);
    try { await onConfirm(); } finally { setBusy(false); }
  };
  return (
    <CvsModal
      open={!!open}
      onClose={onClose}
      title={title || 'Confirm Delete'}
      subtitle={subtitle}
      footer={<>
        <button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={onClose}>Cancel</button>
        <button className="ab dan" style={{ height: 42, padding: '0 20px' }} disabled={busy} onClick={run}>{busy ? 'Working…' : confirmLabel}</button>
      </>}
    >
      <div style={{ padding: 12, background: 'var(--er-bg)', borderLeft: '3px solid var(--er)' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--er-t)', marginBottom: 4 }}>This action cannot be undone</div>
        <div style={{ fontSize: 12, color: 'var(--ts)' }}>{message || 'Are you sure you want to delete this record?'}</div>
      </div>
    </CvsModal>
  );
}

/* ── Procurement Product Modal (create / edit) ──────────────────────────── */
const emptyProduct = {
  code: '', name: '', category_id: '', department: '',
  default_price: '', unit: '', min_order: '',
};

export function ProcurementProductModal({ open, product = null, categories = [], onClose }) {
  const { addToast } = useApp();
  const editing = !!product?.id;
  const isOpen = editing ? !!product : !!open;
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        code: product.code || '',
        name: product.name || '',
        category_id: product.category_id || product.category?.id || '',
        department: product.department || '',
        default_price: product.default_price ?? product.price ?? '',
        unit: product.unit || '',
        min_order: product.min_order ?? '',
      });
    } else if (isOpen) {
      setForm(emptyProduct);
    }
  }, [product, editing, isOpen]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.name.trim().length > 0;

  const close = (changed) => onClose?.(changed);

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        code: form.code.trim() || null,
        name: form.name.trim(),
        category_id: form.category_id || null,
        department: form.department.trim() || null,
        default_price: form.default_price === '' ? null : Number(form.default_price),
        unit: form.unit.trim() || null,
        min_order: form.min_order === '' ? null : Number(form.min_order),
      };
      if (editing) {
        await updateProcurementProduct(product.id, payload);
        addToast('ok', 'Product updated', payload.name);
      } else {
        await createProcurementProduct(payload);
        addToast('ok', 'Product created', payload.name);
      }
      close(true);
    } catch (err) {
      addToast('er', 'Save failed', extractApiError(err));
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <CvsModal
      open={isOpen}
      onClose={() => close(false)}
      title={editing ? 'Edit Product' : 'New Product'}
      subtitle={editing ? product.name : 'Add a product to the procurement catalogue'}
      footer={<>
        <button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={() => close(false)}>Cancel</button>
        <button className="ab pri" style={{ height: 42, padding: '0 20px' }} disabled={!valid || saving} onClick={save}>{saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Product'}</button>
      </>}
    >
      <div className="fg">
        <div className="fi"><label className="fl">Code</label><input className="fin" value={form.code} onChange={(e) => set('code', e.target.value)} placeholder="e.g. PRD-001" /></div>
        <div className="fi"><label className="fl">Name</label><input className="fin" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Product name" /></div>
        <div className="fi">
          <label className="fl">Category</label>
          <select className="fsel" value={form.category_id} onChange={(e) => set('category_id', e.target.value)}>
            <option value="">— Select category —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="fi"><label className="fl">Department</label><input className="fin" value={form.department} onChange={(e) => set('department', e.target.value)} placeholder="e.g. Kitchen, Cleaning" /></div>
        <div className="fi"><label className="fl">Default Price (USD)</label><input className="fin" type="number" min="0" step="0.01" value={form.default_price} onChange={(e) => set('default_price', e.target.value)} placeholder="0.00" /></div>
        <div className="fi"><label className="fl">Unit</label><input className="fin" value={form.unit} onChange={(e) => set('unit', e.target.value)} placeholder="e.g. kg, box, litre" /></div>
        <div className="fi"><label className="fl">Min Order</label><input className="fin" type="number" min="0" value={form.min_order} onChange={(e) => set('min_order', e.target.value)} placeholder="0" /></div>
      </div>
    </CvsModal>
  );
}

/* ── Procurement Category Modal (create / edit) ─────────────────────────── */
const emptyCategory = { code: '', name: '' };

export function ProcurementCategoryModal({ open, category = null, onClose }) {
  const { addToast } = useApp();
  const editing = !!category?.id;
  const isOpen = editing ? !!category : !!open;
  const [form, setForm] = useState(emptyCategory);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({ code: category.code || '', name: category.name || '' });
    } else if (isOpen) {
      setForm(emptyCategory);
    }
  }, [category, editing, isOpen]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.name.trim().length > 0;

  const close = (changed) => onClose?.(changed);

  const save = async () => {
    setSaving(true);
    try {
      const payload = { code: form.code.trim() || null, name: form.name.trim() };
      if (editing) {
        await updateProcurementCategory(category.id, payload);
        addToast('ok', 'Category updated', payload.name);
      } else {
        await createProcurementCategory(payload);
        addToast('ok', 'Category created', payload.name);
      }
      close(true);
    } catch (err) {
      addToast('er', 'Save failed', extractApiError(err));
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <CvsModal
      open={isOpen}
      onClose={() => close(false)}
      size="sm"
      title={editing ? 'Edit Category' : 'New Category'}
      subtitle={editing ? category.name : 'Add a procurement category'}
      footer={<>
        <button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={() => close(false)}>Cancel</button>
        <button className="ab pri" style={{ height: 42, padding: '0 20px' }} disabled={!valid || saving} onClick={save}>{saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Category'}</button>
      </>}
    >
      <div className="fg">
        <div className="fi"><label className="fl">Code</label><input className="fin" value={form.code} onChange={(e) => set('code', e.target.value)} placeholder="e.g. CAT-001" /></div>
        <div className="fi"><label className="fl">Name</label><input className="fin" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Category name" /></div>
      </div>
    </CvsModal>
  );
}

/* ── Manage Categories Modal ────────────────────────────────────────────── */
export function ManageCategoriesModal({ open, categories = [], onClose, onChanged }) {
  const { addToast } = useApp();
  const [editing, setEditing] = useState(null); // category object or { _new: true }
  const [deleting, setDeleting] = useState(null);
  const [viewingId, setViewingId] = useState(null);

  if (!open) return null;

  const remove = async () => {
    try {
      await deleteProcurementCategory(deleting.id);
      addToast('ok', 'Category deleted', deleting.name);
      setDeleting(null);
      onChanged?.();
    } catch (err) {
      addToast('er', 'Delete failed', extractApiError(err));
    }
  };

  return (
    <>
      <CvsModal
        open={open}
        onClose={onClose}
        size="md"
        title="Manage Categories"
        subtitle={`${categories.length} categor${categories.length === 1 ? 'y' : 'ies'}`}
        footer={<>
          <button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={onClose}>Close</button>
          <button className="ab pri" style={{ height: 42, padding: '0 20px' }} onClick={() => setEditing({ _new: true })}>+ New Category</button>
        </>}
      >
        {categories.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--ts)', padding: 20, fontSize: 12 }}>No categories yet — click “+ New Category” to add one.</div>
        ) : (
          <table className="dt">
            <thead><tr><th>Code</th><th>Name</th><th style={{ width: 120 }}>Action</th></tr></thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td><code style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--int)' }}>{c.code || '—'}</code></td>
                  <td><strong>{c.name}</strong></td>
                  <td>
                    <div className="ra">
                      <button className="rb vw" onClick={() => setViewingId(c.id)}>View</button>
                      <button className="rb ed" onClick={() => setEditing(c)}>Edit</button>
                      <button className="rb rv" onClick={() => setDeleting(c)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CvsModal>

      <CategoryDetailModal categoryId={viewingId} onClose={() => setViewingId(null)} />

      <ProcurementCategoryModal
        open={editing?._new ? true : false}
        category={editing && !editing._new ? editing : null}
        onClose={(changed) => { setEditing(null); if (changed) onChanged?.(); }}
      />

      <ConfirmDeleteModal
        open={!!deleting}
        title="Delete Category"
        subtitle={deleting?.name}
        message={`Delete category “${deleting?.name}”? Products using this category will be unlinked.`}
        onConfirm={remove}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}

/* ── Supplier Documents Modal (list + upload + review) ──────────────────── */
export function SupplierDocumentsModal({ open, supplier, onClose }) {
  const { addToast } = useApp();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState('certificate');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);

  const reload = async () => {
    if (!supplier?.id) return;
    setLoading(true);
    try {
      const data = await listSupplierDocuments(supplier.id);
      setDocs(Array.isArray(data) ? data : []);
    } catch (err) {
      addToast('er', 'Failed to load documents', extractApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && supplier?.id) reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, supplier?.id]);

  if (!open || !supplier) return null;

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      await uploadSupplierDocument(supplier.id, { document_type: docType, title: title.trim() || file.name, file });
      addToast('ok', 'Document uploaded', title.trim() || file.name);
      setFile(null); setTitle('');
      reload();
    } catch (err) {
      addToast('er', 'Upload failed', extractApiError(err));
    } finally {
      setUploading(false);
    }
  };

  const approve = async (d) => {
    try {
      await approveSupplierDocument(supplier.id, d.id);
      addToast('ok', 'Document approved', d.title || d.document_type);
      reload();
    } catch (err) { addToast('er', 'Approve failed', extractApiError(err)); }
  };

  const reject = async (d) => {
    const reason = window.prompt('Reason for rejection (optional):', '');
    if (reason === null) return;
    try {
      await rejectSupplierDocument(supplier.id, d.id, reason || '');
      addToast('ok', 'Document rejected', d.title || d.document_type);
      reload();
    } catch (err) { addToast('er', 'Reject failed', extractApiError(err)); }
  };

  const remove = async (d) => {
    if (!window.confirm(`Delete document “${d.title || d.document_type}”?`)) return;
    try {
      await deleteSupplierDocument(supplier.id, d.id);
      addToast('ok', 'Document deleted', d.title || d.document_type);
      reload();
    } catch (err) { addToast('er', 'Delete failed', extractApiError(err)); }
  };

  return (
    <CvsModal
      open={open}
      onClose={onClose}
      size="lg"
      title="Supplier Documents"
      subtitle={supplier.name}
      footer={<button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={onClose}>Close</button>}
    >
      <div style={{ background: 'var(--l2)', border: '1px solid var(--bs)', padding: 12, marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ts)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Upload New Document</div>
        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 1fr auto', gap: 8, alignItems: 'end' }}>
          <div>
            <label className="fl">Type</label>
            <select className="fsel" value={docType} onChange={(e) => setDocType(e.target.value)}>
              <option value="certificate">Certificate</option>
              <option value="tax">Tax Clearance</option>
              <option value="contract">Contract</option>
              <option value="insurance">Insurance</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="fl">Title</label>
            <input className="fin" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Defaults to file name" />
          </div>
          <div>
            <label className="fl">File</label>
            <input className="fin" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>
          <button className="ab pri" style={{ height: 34 }} disabled={!file || uploading} onClick={upload}>{uploading ? 'Uploading…' : 'Upload'}</button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--ts)', padding: 20, fontSize: 12 }}>Loading documents…</div>
      ) : docs.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--ts)', padding: 20, fontSize: 12 }}>No documents on file.</div>
      ) : (
        <table className="dt">
          <thead><tr><th>Type</th><th>Title</th><th>Status</th><th>Uploaded</th><th style={{ width: 220 }}>Action</th></tr></thead>
          <tbody>
            {docs.map((d) => {
              const status = (d.status || 'pending').toLowerCase();
              const tagType = status === 'approved' ? 'active' : status === 'rejected' ? 'over' : 'pending';
              return (
                <tr key={d.id}>
                  <td style={{ fontSize: 12 }}>{d.document_type || '—'}</td>
                  <td><strong>{d.title || '—'}</strong>{d.file_url && <> · <a href={d.file_url} target="_blank" rel="noreferrer" style={{ color: 'var(--int)', fontSize: 11 }}>View</a></>}</td>
                  <td><StatusTag type={tagType} label={status.toUpperCase()} /></td>
                  <td style={{ fontSize: 11, color: 'var(--ts)', fontFamily: "'IBM Plex Mono',monospace" }}>{d.uploaded_at || d.created_at || '—'}</td>
                  <td>
                    <div className="ra">
                      {status !== 'approved' && <button className="rb ap" onClick={() => approve(d)}>Approve</button>}
                      {status !== 'rejected' && <button className="rb rv" onClick={() => reject(d)}>Reject</button>}
                      <button className="rb ed" onClick={() => remove(d)}>Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </CvsModal>
  );
}
