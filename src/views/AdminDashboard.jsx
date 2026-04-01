import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import StatusTag from '../components/shared/StatusTag';
import BrandChip from '../components/shared/BrandChip';
import Breadcrumbs from '../components/shared/Breadcrumbs';
import { InviteUserModal, EditUserModal, RevokeUserModal } from '../components/modals/AllModals';

const USERS_DATA = [
  { name: 'T. Ndlovu',   email: 't.ndlovu@simbisa.co.zw',   role: 'brandmgr',    roleLabel: 'Brand Manager',  brand: 'Chicken Inn',  shop: 'All shops', invitedBy: 'S. Moyo (Admin)', status: 'active' },
  { name: 'C. Mutandwa', email: 'c.mutandwa@simbisa.co.zw', role: 'accountant',  roleLabel: 'Brand Accountant', brand: 'Pizza Inn',  shop: 'All shops', invitedBy: 'S. Moyo (Admin)', status: 'active' },
  { name: 'K. Mutasa',   email: 'k.mutasa@simbisa.co.zw',   role: 'shopmgr',     roleLabel: 'Shop Manager',   brand: 'Chicken Inn',  shop: 'Sh-14',    invitedBy: 'S. Moyo (Admin)', status: 'active' },
  { name: 'R. Chikwanda',email: 'r.chikwanda@simbisa.co.zw',role: 'procurement', roleLabel: 'Procurement',    brand: 'Head Office',  shop: 'N/A',      invitedBy: 'S. Moyo (Admin)', status: 'active' },
  { name: 'J. Moyo',     email: 'j.moyo@simbisa.co.zw',     role: 'shopmgr',     roleLabel: 'Shop Manager',   brand: "Roco Mamma's", shop: 'Sh-05',    invitedBy: 'S. Moyo (Admin)', status: 'pending' },
  { name: 'A. Sibanda',  email: 'a.sibanda@simbisa.co.zw',  role: 'procurement', roleLabel: 'Procurement',    brand: 'Head Office',  shop: 'N/A',      invitedBy: 'S. Moyo (Admin)', status: 'pending' },
];

const ROLES_CONFIG = [
  { role: 'Shop Manager',    count: 24, perms: ['Submit requests', 'View own requests', 'Track payment status', 'Request exceptions'] },
  { role: 'Brand Accountant', count: 9, perms: ['Validate requests', 'Adjust amounts', 'Reject requests', 'Set budgets', 'View brand reports'] },
  { role: 'Brand Manager',   count: 9,  perms: ['Approve payments', 'Batch pay via InnBucks', 'Approve exceptions', 'View brand analytics'] },
  { role: 'Procurement',     count: 3,  perms: ['Manage suppliers', 'Verify credentials', 'View spend analytics', 'Export reports'] },
  { role: 'Executive',       count: 2,  perms: ['View all dashboards', 'Group-wide analytics', 'InnBucks sales', 'Supplier analytics'] },
  { role: 'Admin',           count: 1,  perms: ['Invite users', 'Manage roles', 'View system audit', 'Configure settings'] },
];

const SYSTEM_LOGS = [
  { color: 'var(--int)', time: '23 Mar 14:32', text: '<strong>USER LOGIN</strong> — T. Ndlovu · Role: Brand Manager · Brand: Chicken Inn', user: 'IP: 196.xx.xx.xx · Chrome / Windows', chip: <BrandChip brand="Chicken Inn" /> },
  { color: 'var(--ok)', time: '23 Mar 13:18',  text: "<strong>INVITE SENT</strong> — J. Moyo invited as Shop Manager · Roco Mamma's Sh-05",  user: 'S. Moyo (Admin)', chip: <BrandChip brand="Roco Mamma's" /> },
  { color: 'var(--er)', time: '23 Mar 12:11',  text: '<strong>FAILED LOGIN</strong> — unknown@mail.com · 3 attempts', user: 'IP: 102.xx.xx.xx · Blocked after 3 attempts', chip: <span className="bc2" style={{ background: '#fff1f1', color: 'var(--er)' }}>SYSTEM</span> },
  { color: 'var(--ok)', time: '23 Mar 09:05',  text: '<strong>SUPPLIER ACTIVATED</strong> — CleanPro Supplies · TIN: ZW-TIN-20012345', user: 'R. Chikwanda (Procurement)', chip: <span className="bc2" style={{ background: 'var(--pur-bg)', color: 'var(--pur)' }}>SYSTEM</span> },
  { color: 'var(--int)', time: '22 Mar 16:44', text: '<strong>BUDGET UPDATED</strong> — Sh-08 Sam Levy budget set to $900 for March', user: 'C. Mutandwa (Brand Accountant) · Pizza Inn', chip: <BrandChip brand="Pizza Inn" /> },
  { color: 'var(--wa)', time: '22 Mar 11:20',  text: '<strong>EXCEPTION LOGGED</strong> — PC-0041 · Sh-14 override authorised by T. Ndlovu', user: 'T. Ndlovu (Brand Manager) · Chicken Inn', chip: <BrandChip brand="Chicken Inn" /> },
];

export default function AdminDashboard() {
  const { addToast, activeTab, brandFilter, setBrandFilter } = useApp();
  const [tab, setTab] = useState(activeTab ?? 0);
  useEffect(() => { setTab(activeTab ?? 0); }, [activeTab]);
  const [showInvite, setShowInvite] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [revokeUser, setRevokeUser] = useState(null);
  const [users, setUsers] = useState(USERS_DATA);
  const [logSearch, setLogSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const cancelInvite = (email) => {
    setUsers(u => u.filter(x => x.email !== email));
    addToast('wa', 'Invite cancelled', `Invitation to ${email} has been withdrawn`);
  };

  const filteredLogs = SYSTEM_LOGS.filter(l => {
    const matchRole = roleFilter === 'All' || l.user.includes(roleFilter);
    const matchBrand = brandFilter === 'All Brands' || l.user.includes(brandFilter) || l.text.includes(brandFilter);
    return matchRole && matchBrand;
  });

  const tabs = ['Users & Invites', 'Roles & Permissions', 'System Audit'];

  return (
    <>
      <div className="ph">
        <Breadcrumbs items={[
          { label: 'CVS' },
          { label: 'Admin' },
          { label: 'User Management' },
        ]} />
        <div className="ptabs">
          {tabs.map((t, i) => (
            <button key={t} className={`ptab${tab === i ? ' on' : ''}`} onClick={() => setTab(i)}>{t}</button>
          ))}
        </div>
      </div>
      <div className="cnt">

        {/* ── Tab 0: Users & Invites ────────────────────────────────────── */}
        {tab === 0 && (<>
          <div className="kg c4">
            <div className="kc bl"><div className="kl">Total Users</div><div className="kv">{users.filter(u => u.status === 'active').length}</div><div className="kd nt">Active accounts</div><div className="ki">👥</div></div>
            <div className="kc yw"><div className="kl">Pending Invites</div><div className="kv">{users.filter(u => u.status === 'pending').length}</div><div className="kd nt">Awaiting acceptance</div><div className="ki">✉</div></div>
            <div className="kc gn"><div className="kl">Active Sessions</div><div className="kv">12</div><div className="kd nt">Right now</div><div className="ki">🟢</div></div>
            <div className="kc rd"><div className="kl">Failed Logins (24h)</div><div className="kv">3</div><div className="kd dn">Monitor</div><div className="ki">🔒</div></div>
          </div>
          <div className="tbbar">
            <div className="tbt">User Invitations</div>
            <button className="ab pri" onClick={() => setShowInvite(true)}>+ Invite User</button>
          </div>
          <table className="dt">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Brand / Scope</th><th>Shop</th><th>Invited By</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.email}>
                  <td><div style={{ fontWeight: 600 }}>{u.name}</div></td>
                  <td style={{ fontSize: 12, color: 'var(--ts)', fontFamily: "'IBM Plex Mono',monospace" }}>{u.email}</td>
                  <td><StatusTag type={u.role} /></td>
                  <td>
                    {['Head Office','All Brands'].includes(u.brand)
                      ? <span style={{ color: 'var(--ts)', fontSize: 12 }}>{u.brand}</span>
                      : <BrandChip brand={u.brand} />
                    }
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--ts)' }}>{u.shop}</td>
                  <td style={{ fontSize: 12, color: 'var(--ts)' }}>{u.invitedBy}</td>
                  <td><StatusTag type={u.status} /></td>
                  <td>
                    <div className="ra">
                      {u.status === 'active' ? (
                        <><button className="rb ed" onClick={() => setEditUser(u)} title="Edit user">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                      </button>
                          <button className="rb rj" onClick={() => setRevokeUser(u)}>Revoke</button></>
                      ) : (
                        <><button className="rb ap" onClick={() => addToast('ok', 'Invite resent', `Email dispatched to ${u.email}`)}>Resend</button>
                          <button className="rb rj" onClick={() => cancelInvite(u.email)}>Cancel</button></>
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
              <div className="ntf-b">CVS uses a strict role hierarchy. Each role has defined permissions. Contact system admin to adjust role permissions.</div>
            </div>
          </div>
          <div className="kg c3">
            <div className="kc bl"><div className="kl">Total Roles</div><div className="kv">{ROLES_CONFIG.length}</div><div className="kd nt">Defined in system</div><div className="ki">🔑</div></div>
            <div className="kc gn"><div className="kl">Total Users</div><div className="kv">{ROLES_CONFIG.reduce((s,r) => s+r.count, 0)}</div><div className="kd nt">Across all roles</div><div className="ki">👥</div></div>
            <div className="kc yw"><div className="kl">Pending</div><div className="kv">{users.filter(u => u.status === 'pending').length}</div><div className="kd nt">Invites outstanding</div><div className="ki">⏳</div></div>
          </div>
          <div className="tbbar"><div className="tbt">Role Definitions &amp; Permissions</div></div>
          <table className="dt">
            <thead><tr><th>Role</th><th>Users</th><th>Permissions</th><th>Access Level</th><th>Action</th></tr></thead>
            <tbody>
              {ROLES_CONFIG.map((r, i) => (
                <tr key={r.role}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{r.role}</div>
                    <div style={{ fontSize: 10, color: 'var(--ts)', fontFamily: "'IBM Plex Mono',monospace", marginTop: 2 }}>ROLE-{String(i+1).padStart(2,'0')}</div>
                  </td>
                  <td style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, fontWeight: 600 }}>{r.count}</td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {r.perms.map(p => (
                        <span key={p} style={{ background: 'var(--info-bg)', color: 'var(--info)', fontSize: 10, padding: '2px 6px', fontFamily: "'IBM Plex Mono',monospace" }}>{p}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 60, height: 6, background: 'var(--l3)' }}>
                        <div style={{ height: '100%', width: `${(6-i)/6*100}%`, background: 'var(--int)' }} />
                      </div>
                      <span style={{ fontSize: 10, fontFamily: "'IBM Plex Mono',monospace", color: 'var(--ts)' }}>{Math.round((6-i)/6*100)}%</span>
                    </div>
                  </td>
                  <td><button className="rb ed" onClick={() => addToast('info', `Edit ${r.role}`, 'Role permission editor opened')} title="Edit role">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                      </button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>)}

        {/* ── Tab 2: System Audit ───────────────────────────────────────── */}
        {tab === 2 && (<>
          <div className="kg c4">
            <div className="kc bl"><div className="kl">Audit Events (24h)</div><div className="kv">{SYSTEM_LOGS.length}</div><div className="kd nt">Total logged actions</div><div className="ki">📋</div></div>
            <div className="kc gn"><div className="kl">User Logins</div><div className="kv">34</div><div className="kd up">↑ Active sessions</div><div className="ki">🔑</div></div>
            <div className="kc rd"><div className="kl">Failed Attempts</div><div className="kv">3</div><div className="kd dn">1 IP blocked</div><div className="ki">🔒</div></div>
            <div className="kc yw"><div className="kl">System Events</div><div className="kv">8</div><div className="kd nt">Auto-generated</div><div className="ki">⚙</div></div>
          </div>
          <div className="tbbar">
            <div className="tbt">System Audit Log — All Users</div>
            <input className="srch" placeholder="Search logs…" value={logSearch} onChange={e => setLogSearch(e.target.value)} />
            <select className="fsel" style={{ width: 150, height: 32, fontSize: 12 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="All">All Roles</option>
              <option>Brand Manager</option><option>Brand Accountant</option><option>Procurement</option><option>Admin</option>
            </select>
            <select className="fsel" style={{ width: 130, height: 32, fontSize: 12 }} value={brandFilter} onChange={e => setBrandFilter(e.target.value)}>
              <option value="All Brands">All Brands</option>
              <option>Chicken Inn</option><option>Pizza Inn</option><option>Creamy Inn</option><option>Nando's</option><option>Steers</option><option>Roco Mamma's</option><option>Ocean Basket</option><option>Hefelies</option><option>Pastino's</option>
            </select>
          </div>
          <div style={{ background: 'var(--l1)', border: '1px solid var(--bs)', padding: '8px 14px' }}>
            {filteredLogs.length === 0
              ? <div style={{ textAlign: 'center', color: 'var(--ts)', padding: 20 }}>No audit events match the selected filters.</div>
              : filteredLogs.filter(e => !logSearch || e.text.toLowerCase().includes(logSearch.toLowerCase()) || e.user.toLowerCase().includes(logSearch.toLowerCase())).map((e, i) => (
                <div className="log-e" key={i}>
                  <div className="log-dot" style={{ background: e.color }} />
                  <div className="log-time">{e.time}</div>
                  <div style={{ flex: 1 }}>
                    <div className="log-txt" dangerouslySetInnerHTML={{ __html: e.text }} />
                    <div className="log-user">{e.user}</div>
                  </div>
                  {e.chip}
                </div>
              ))
            }
          </div>
        </>)}
      </div>

      <InviteUserModal open={showInvite} onClose={() => setShowInvite(false)} />
      <EditUserModal user={editUser} onClose={() => setEditUser(null)} />
      <RevokeUserModal user={revokeUser} onClose={() => setRevokeUser(null)} />
    </>
  );
}
