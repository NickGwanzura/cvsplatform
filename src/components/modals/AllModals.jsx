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
        <button className="ab dan" style={{ height: 42, padding: '0 20px' }} onClick={() => { onConfirm?.(); onClose(); setReason(''); }}>Confirm Rejection</button>
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

/* ── New Supplier Modal ─────────────────────────────────────────────────── */
export function NewSupplierModal({ open, onClose }) {
  const { addToast } = useApp();
  return (
    <CvsModal open={open} onClose={onClose} title="Register New Supplier" subtitle="New suppliers are reviewed by Procurement before activation"
      footer={<>
        <button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={onClose}>Cancel</button>
        <button className="ab pri" style={{ height: 42, padding: '0 20px' }} onClick={() => { onClose(); addToast('info', 'Supplier registration submitted', 'Procurement will verify within 24–48 hours'); }}>Submit for Review</button>
      </>}
    >
      <div className="fg">
        <div className="fi"><label className="fl">Supplier Name</label><input className="fin" placeholder="Company legal name" /></div>
        <div className="fi"><label className="fl">Trading Name</label><input className="fin" placeholder="If different from legal name" /></div>
        <div className="fi"><label className="fl">Tax / TIN Number</label><input className="fin" placeholder="ZW-TIN-XXXXXXXX" /></div>
        <div className="fi"><label className="fl">Category</label><select className="fsel"><option>Maintenance & Repairs</option><option>Cleaning Supplies</option><option>Gas & Utilities</option><option>Stationery</option><option>Equipment</option><option>Other</option></select></div>
        <div className="fi"><label className="fl">InnBucks Wallet Number</label><input className="fin" placeholder="IB-XXXX-XXXX" /></div>
        <div className="fi"><label className="fl">Contact Phone</label><input className="fin" placeholder="+263 7X XXX XXXX" /></div>
        <div className="fi full"><label className="fl">Business Address</label><input className="fin" placeholder="Street address, City" /></div>
      </div>
      <div style={{ marginTop: 11, padding: 10, background: 'var(--info-bg)', borderLeft: '3px solid var(--int)' }}>
        <div style={{ fontSize: 11, color: 'var(--info)' }}>Procurement will verify supplier credentials and activate within 24–48 hours. You will be notified by email.</div>
      </div>
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
export function BudgetModal({ open, onClose }) {
  const { addToast } = useApp();
  const [budgets, setBudgets] = useState([]);
  const update = (id, field, val) => setBudgets(b => b.map(s => s.id === id ? { ...s, [field]: val } : s));
  return (
    <CvsModal open={!!open} onClose={onClose} size="lg" title="Set Shop Budgets" subtitle="Set monthly petty cash limits per shop"
      footer={<>
        <button className="ab sec" style={{ height: 42, padding: '0 20px' }} onClick={onClose}>Cancel</button>
        <button className="ab pri" style={{ height: 42, padding: '0 20px' }} onClick={() => { onClose(); addToast('ok', 'Budgets updated', `Monthly budgets saved for ${budgets.length} shop${budgets.length === 1 ? '' : 's'}`); }}>
          Save Budgets
        </button>
      </>}
    >
      <table className="dt">
        <thead><tr><th>Shop</th><th>Location</th><th>Current Budget</th><th>New Monthly Budget (USD)</th><th>Category Caps</th></tr></thead>
        <tbody>
          {budgets.length === 0 ? (
            <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--ts)', padding: 20 }}>No data.</td></tr>
          ) : budgets.map(s => (
            <tr key={s.id}>
              <td><strong>{s.id}</strong></td>
              <td>{s.loc}</td>
              <td>${s.budget.toLocaleString()}</td>
              <td><input className="fin" type="number" value={s.budget} onChange={e => update(s.id, 'budget', +e.target.value)} style={{ width: 120 }} /></td>
              <td><input className="fin" type="text" value={s.caps} onChange={e => update(s.id, 'caps', e.target.value)} placeholder="e.g. Cleaning $300" style={{ width: 180 }} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 13, padding: 10, background: 'var(--info-bg)', borderLeft: '3px solid var(--int)' }}>
        <div style={{ fontSize: 11, color: 'var(--info)' }}>Threshold alerts trigger at 80%. Shops at 80–99% show MONITOR, at 90%+ trigger exception workflow. All budget changes are logged.</div>
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
