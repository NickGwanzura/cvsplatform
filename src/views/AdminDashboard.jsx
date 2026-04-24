import { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import StatusTag from '../components/shared/StatusTag';
import BrandChip from '../components/shared/BrandChip';
import Breadcrumbs from '../components/shared/Breadcrumbs';
import {
  InviteUserModal,
  EditUserModal,
  RevokeUserModal,
  CreateUserModal,
  BrandEditModal,
  ShopEditModal,
  BrandDetailModal,
  ShopDetailModal,
  UserDetailModal,
  InvitationDetailModal,
  PermissionsModal,
} from '../components/modals/AllModals';
import {
  listUsers,
  listInvitations,
  listRoles,
  listBrands,
  listShops,
  resendInvitation,
  revokeInvite,
} from '../lib/cvsApi';

const SYSTEM_LOGS = [];

function fmtDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return iso; }
}

function inviteStatus(inv) {
  if (inv.revoked_at) return 'rejected';
  if (inv.accepted_at) return 'active';
  if (inv.expires_at && new Date(inv.expires_at) < new Date()) return 'exception';
  return 'pending';
}

export default function AdminDashboard() {
  const { addToast, activeTab, brandFilter, setBrandFilter } = useApp();
  const [tab, setTab] = useState(activeTab ?? 0);
  useEffect(() => { setTab(activeTab ?? 0); }, [activeTab]);

  const [users, setUsers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [roles, setRoles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [showInvite, setShowInvite] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [revokeUser, setRevokeUser] = useState(null);
  const [editBrand, setEditBrand] = useState(null);
  const [editShop, setEditShop] = useState(null);
  const [viewBrandId, setViewBrandId] = useState(null);
  const [viewShopId, setViewShopId] = useState(null);
  const [viewUserId, setViewUserId] = useState(null);
  const [viewInvitationId, setViewInvitationId] = useState(null);
  const [showPermissions, setShowPermissions] = useState(false);
  const [logSearch, setLogSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const refresh = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [u, i, r, b, s] = await Promise.all([
        listUsers().catch(() => []),
        listInvitations().catch(() => []),
        listRoles().catch(() => []),
        listBrands().catch(() => []),
        listShops().catch(() => []),
      ]);
      setUsers(u || []);
      setInvitations(i || []);
      setRoles(r || []);
      setBrands(b || []);
      setShops(s || []);
    } catch (err) {
      setLoadError(err?.response?.data?.message || err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const brandById = useMemo(() => Object.fromEntries(brands.map((b) => [b.id, b])), [brands]);
  const shopById = useMemo(() => Object.fromEntries(shops.map((s) => [s.id, s])), [shops]);
  const roleById = useMemo(() => Object.fromEntries(roles.map((r) => [r.id, r])), [roles]);

  // Build unified user+invitation list for the table.
  const rows = useMemo(() => {
    const userRows = users.map((u) => {
      const assignment = u.assignments?.find((a) => a.is_active) || u.assignments?.[0];
      const role = roleById[assignment?.role_id];
      const brand = brandById[assignment?.brand_id];
      const shop = shopById[assignment?.shop_id];
      return {
        kind: 'user',
        id: u.id,
        name: u.full_name || '—',
        email: u.email,
        roleLabel: role?.name || '—',
        roleCode: role?.code || '',
        roleId: role?.id,
        brand: brand?.name || (role?.scope_type === 'global' ? 'Head Office' : '—'),
        brandId: brand?.id,
        shop: shop?.name || '—',
        shopId: shop?.id,
        invitedBy: '—',
        status: u.status || 'active',
        raw: u,
      };
    });
    const invitationRows = invitations
      .filter((inv) => !inv.accepted_at)
      .map((inv) => {
        const role = inv.role || roleById[inv.role_id];
        const brand = inv.brand || brandById[inv.brand_id];
        const shop = inv.shop || shopById[inv.shop_id];
        return {
          kind: 'invite',
          id: inv.id,
          name: inv.full_name || '—',
          email: inv.email,
          roleLabel: role?.name || '—',
          roleCode: role?.code || '',
          roleId: role?.id,
          brand: brand?.name || (role?.scope_type === 'global' ? 'Head Office' : '—'),
          brandId: brand?.id,
          shop: shop?.name || '—',
          shopId: shop?.id,
          invitedBy: inv.invited_by?.full_name || '—',
          status: inviteStatus(inv),
          raw: inv,
        };
      });
    return [...userRows, ...invitationRows];
  }, [users, invitations, brandById, shopById, roleById]);

  const activeUsers = users.length;
  const pendingInvites = invitations.filter((i) => !i.accepted_at && !i.revoked_at).length;

  // Per-role user counts for Tab 1.
  const roleUserCount = useMemo(() => {
    const counts = {};
    users.forEach((u) => {
      (u.assignments || []).forEach((a) => {
        if (!a.is_active) return;
        counts[a.role_id] = (counts[a.role_id] || 0) + 1;
      });
    });
    return counts;
  }, [users]);

  const handleResend = async (inv) => {
    try {
      await resendInvitation(inv.id);
      addToast('ok', 'Invite resent', `Email dispatched to ${inv.email}`);
      refresh();
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Could not resend';
      addToast('er', 'Resend failed', msg);
    }
  };

  const handleCancelInvite = async (inv) => {
    try {
      await revokeInvite(inv.id);
      addToast('wa', 'Invite revoked', `Invitation to ${inv.email} has been withdrawn`);
      refresh();
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Could not revoke';
      addToast('er', 'Revoke failed', msg);
    }
  };

  const tabs = ['Users & Invites', 'Roles & Permissions', 'Brands & Shops', 'System Audit'];

  return (
    <>
      <div className="ph">
        <Breadcrumbs items={[
          { label: 'CVS' },
          { label: 'Admin' },
          { label: tabs[tab] || 'User Management' },
        ]} />
        <div className="ptabs">
          {tabs.map((t, i) => (
            <button key={t} className={`ptab${tab === i ? ' on' : ''}`} onClick={() => setTab(i)}>{t}</button>
          ))}
        </div>
      </div>
      <div className="cnt">
        {loadError && (
          <div className="ntf er" style={{ marginBottom: 16 }}>
            <div>
              <div className="ntf-t">Failed to load data</div>
              <div className="ntf-b">{loadError}</div>
            </div>
            <button className="ab sec" style={{ height: 30 }} onClick={refresh}>Retry</button>
          </div>
        )}

        {/* ── Tab 0: Users & Invites ────────────────────────────────────── */}
        {tab === 0 && (<>
          <div className="kg c4">
            <div className="kc bl"><div className="kl">Total Users</div><div className="kv">{activeUsers}</div><div className="kd nt">All accounts</div><div className="ki">👥</div></div>
            <div className="kc yw"><div className="kl">Pending Invites</div><div className="kv">{pendingInvites}</div><div className="kd nt">Awaiting acceptance</div><div className="ki">✉</div></div>
            <div className="kc gn"><div className="kl">Active Sessions</div><div className="kv">—</div><div className="kd nt">—</div><div className="ki">🟢</div></div>
            <div className="kc rd"><div className="kl">Failed Logins (24h)</div><div className="kv">—</div><div className="kd nt">—</div><div className="ki">🔒</div></div>
          </div>
          <div className="tbbar">
            <div className="tbt">Users &amp; Invitations</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="ab sec" onClick={() => setShowCreate(true)}>+ Create User</button>
              <button className="ab pri" onClick={() => setShowInvite(true)}>+ Invite User</button>
            </div>
          </div>
          <table className="dt">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Brand / Scope</th><th>Shop</th><th>Invited By</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {loading && rows.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--ts)', padding: 20 }}>Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--ts)', padding: 20 }}>No users or invitations yet.</td></tr>
              ) : rows.map((r) => (
                <tr key={`${r.kind}-${r.id}`}>
                  <td><div style={{ fontWeight: 600 }}>{r.name}</div></td>
                  <td style={{ fontSize: 12, color: 'var(--ts)', fontFamily: "'IBM Plex Mono',monospace" }}>{r.email}</td>
                  <td>{r.roleLabel !== '—' ? <StatusTag type={r.roleCode?.toLowerCase()} label={r.roleLabel} /> : '—'}</td>
                  <td>
                    {['Head Office','All Brands','—'].includes(r.brand)
                      ? <span style={{ color: 'var(--ts)', fontSize: 12 }}>{r.brand}</span>
                      : <BrandChip brand={r.brand} />
                    }
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--ts)' }}>{r.shop}</td>
                  <td style={{ fontSize: 12, color: 'var(--ts)' }}>{r.invitedBy}</td>
                  <td><StatusTag type={r.status} /></td>
                  <td>
                    <div className="ra">
                      {r.kind === 'user' ? (
                        <>
                          <button className="rb vw" onClick={() => setViewUserId(r.id)} title="View user">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          </button>
                          <button className="rb ed" onClick={() => setEditUser(r)} title="Edit user">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                          </button>
                          <button className="rb rj" onClick={() => setRevokeUser(r)}>Revoke</button>
                        </>
                      ) : (
                        <>
                          <button className="rb vw" onClick={() => setViewInvitationId(r.id)} title="View invitation">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          </button>
                          <button className="rb ap" onClick={() => handleResend(r.raw)}>Resend</button>
                          <button className="rb rj" onClick={() => handleCancelInvite(r.raw)}>Cancel</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>)}

        {/* ── Tab 1: Roles & Permissions ────────────────────────────────── */}
        {tab === 1 && (<>
          <div className="ntf info" style={{ marginBottom: 16 }}>
            <div>
              <div className="ntf-t">Role-Based Access Control</div>
              <div className="ntf-b">Roles and their permissions are defined server-side. Contact the backend team to adjust role permissions.</div>
            </div>
          </div>
          <div className="kg c3">
            <div className="kc bl"><div className="kl">Total Roles</div><div className="kv">{roles.length}</div><div className="kd nt">Defined in system</div><div className="ki">🔑</div></div>
            <div className="kc gn"><div className="kl">Total Users</div><div className="kv">{users.length}</div><div className="kd nt">Across all roles</div><div className="ki">👥</div></div>
            <div className="kc yw"><div className="kl">Pending</div><div className="kv">{pendingInvites}</div><div className="kd nt">Invites outstanding</div><div className="ki">⏳</div></div>
          </div>
          <div className="tbbar">
            <div className="tbt">Role Definitions &amp; Permissions</div>
            <button className="ab sec" style={{ height: 32, fontSize: 12 }} onClick={() => setShowPermissions(true)}>View all system permissions</button>
          </div>
          <table className="dt">
            <thead><tr><th>Role</th><th>Users</th><th>Scope</th><th>Permissions</th></tr></thead>
            <tbody>
              {loading && roles.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--ts)', padding: 20 }}>Loading…</td></tr>
              ) : roles.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--ts)', padding: 20 }}>No roles available.</td></tr>
              ) : roles.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{r.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--ts)', fontFamily: "'IBM Plex Mono',monospace", marginTop: 2 }}>{r.code}</div>
                  </td>
                  <td style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, fontWeight: 600 }}>{roleUserCount[r.id] || 0}</td>
                  <td style={{ fontSize: 12, color: 'var(--ts)', textTransform: 'capitalize' }}>{r.scope_type || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {(r.permissions || []).map((p) => (
                        <span key={p.id} style={{ background: 'var(--info-bg)', color: 'var(--info)', fontSize: 10, padding: '2px 6px', fontFamily: "'IBM Plex Mono',monospace" }}>{p.code}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>)}

        {/* ── Tab 2: Brands & Shops ─────────────────────────────────────── */}
        {tab === 2 && (<>
          <div className="kg c3">
            <div className="kc bl"><div className="kl">Total Brands</div><div className="kv">{brands.length}</div><div className="kd nt">Active brands</div><div className="ki">🏷️</div></div>
            <div className="kc gn"><div className="kl">Total Shops</div><div className="kv">{shops.length}</div><div className="kd nt">Across all brands</div><div className="ki">🏬</div></div>
            <div className="kc yw"><div className="kl">Unassigned Shops</div><div className="kv">{shops.filter((s) => !s.brand_id).length}</div><div className="kd nt">No brand set</div><div className="ki">⚠</div></div>
          </div>

          <div className="tbbar">
            <div className="tbt">Brands</div>
            <button className="ab pri" onClick={() => setEditBrand({})}>+ New Brand</button>
          </div>
          <table className="dt">
            <thead><tr><th>Code</th><th>Name</th><th>Status</th><th>Shops</th><th>Action</th></tr></thead>
            <tbody>
              {loading && brands.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--ts)', padding: 20 }}>Loading…</td></tr>
              ) : brands.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--ts)', padding: 20 }}>No brands yet.</td></tr>
              ) : brands.map((b) => (
                <tr key={b.id}>
                  <td><code style={{ color: 'var(--info)', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11 }}>{b.code}</code></td>
                  <td><div style={{ fontWeight: 600 }}>{b.name}</div></td>
                  <td><StatusTag type={b.status} /></td>
                  <td style={{ fontSize: 12, color: 'var(--ts)' }}>{shops.filter((s) => s.brand_id === b.id).length}</td>
                  <td>
                    <div className="ra">
                      <button className="rb vw" onClick={() => setViewBrandId(b.id)} title="View brand">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                      <button className="rb ed" onClick={() => setEditBrand(b)} title="Edit brand">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="tbbar" style={{ marginTop: 24 }}>
            <div className="tbt">Shops</div>
            <button className="ab pri" onClick={() => setEditShop({})} disabled={brands.length === 0}>+ New Shop</button>
          </div>
          <table className="dt">
            <thead><tr><th>Code</th><th>Name</th><th>Brand</th><th>Location</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {loading && shops.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--ts)', padding: 20 }}>Loading…</td></tr>
              ) : shops.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--ts)', padding: 20 }}>No shops yet.</td></tr>
              ) : shops.map((s) => (
                <tr key={s.id}>
                  <td><code style={{ color: 'var(--info)', fontFamily: "'IBM Plex Mono',monospace", fontSize: 11 }}>{s.code}</code></td>
                  <td><div style={{ fontWeight: 600 }}>{s.name}</div></td>
                  <td>{s.brand?.name ? <BrandChip brand={s.brand.name} /> : <span style={{ color: 'var(--ts)', fontSize: 12 }}>—</span>}</td>
                  <td style={{ fontSize: 12, color: 'var(--ts)' }}>{s.location || '—'}</td>
                  <td><StatusTag type={s.status} /></td>
                  <td>
                    <div className="ra">
                      <button className="rb vw" onClick={() => setViewShopId(s.id)} title="View shop">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                      <button className="rb ed" onClick={() => setEditShop(s)} title="Edit shop">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>)}

        {/* ── Tab 3: System Audit (backend not yet available) ──────────── */}
        {tab === 3 && (<>
          <div className="kg c4">
            <div className="kc bl"><div className="kl">Audit Events (24h)</div><div className="kv">—</div><div className="kd nt">—</div><div className="ki">📋</div></div>
            <div className="kc gn"><div className="kl">User Logins</div><div className="kv">—</div><div className="kd nt">—</div><div className="ki">🔑</div></div>
            <div className="kc rd"><div className="kl">Failed Attempts</div><div className="kv">—</div><div className="kd nt">—</div><div className="ki">🔒</div></div>
            <div className="kc yw"><div className="kl">System Events</div><div className="kv">—</div><div className="kd nt">—</div><div className="ki">⚙</div></div>
          </div>
          <div className="tbbar">
            <div className="tbt">System Audit Log</div>
            <input className="srch" placeholder="Search logs…" value={logSearch} onChange={(e) => setLogSearch(e.target.value)} />
            <select className="fsel" style={{ width: 150, height: 32, fontSize: 12 }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="All">All Roles</option>
              {roles.map((r) => <option key={r.id}>{r.name}</option>)}
            </select>
            <select className="fsel" style={{ width: 130, height: 32, fontSize: 12 }} value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}>
              <option value="All Brands">All Brands</option>
              {brands.map((b) => <option key={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div style={{ background: 'var(--l1)', border: '1px solid var(--bs)', padding: '8px 14px' }}>
            <div style={{ textAlign: 'center', color: 'var(--ts)', padding: 20 }}>Audit log endpoint not yet available on the backend.</div>
          </div>
        </>)}
      </div>

      <InviteUserModal open={showInvite} onClose={() => { setShowInvite(false); refresh(); }} />
      <CreateUserModal open={showCreate} onClose={() => { setShowCreate(false); refresh(); }} />
      <EditUserModal user={editUser} roles={roles} brands={brands} onClose={(changed) => { setEditUser(null); if (changed) refresh(); }} />
      <RevokeUserModal user={revokeUser} onClose={(changed) => { setRevokeUser(null); if (changed) refresh(); }} />
      <BrandEditModal brand={editBrand} onClose={(changed) => { setEditBrand(null); if (changed) refresh(); }} />
      <ShopEditModal shop={editShop} brands={brands} onClose={(changed) => { setEditShop(null); if (changed) refresh(); }} />
      <BrandDetailModal brandId={viewBrandId} onClose={() => setViewBrandId(null)} />
      <ShopDetailModal shopId={viewShopId} onClose={() => setViewShopId(null)} />
      <UserDetailModal userId={viewUserId} onClose={() => setViewUserId(null)} />
      <InvitationDetailModal invitationId={viewInvitationId} onClose={() => setViewInvitationId(null)} />
      <PermissionsModal open={showPermissions} onClose={() => setShowPermissions(false)} />
    </>
  );
}
