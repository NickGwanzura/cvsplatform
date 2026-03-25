import { useApp } from '../../context/AppContext';
import { ROLES } from '../../data/mockData';

export default function AppHeader() {
  const { session, logout, headerTitle, openModal } = useApp();
  if (!session) return null;
  const r = ROLES[session.roleKey];
  const initials = session.name.split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 48,
      background: 'var(--l1)', borderBottom: '1px solid var(--bs)',
      display: 'flex', alignItems: 'center', zIndex: 100, padding: '0 16px', gap: 12
    }}>
      <div className="cvs-header-sq" style={{ background: session.color }}>{session.code}</div>
      <div className="cvs-header-brand">
        <div className="cvs-header-nm">Cash Verification System</div>
        <div className="cvs-header-sub">{session.brand} — {r.label}</div>
      </div>
      <div className="cvs-header-divider" />
      <div className="cvs-header-title">{headerTitle}</div>
      <span className="cvs-header-tag" style={{ background: session.color }}>CVS</span>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button
          style={{ width: 44, height: 48, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tp)' }}
          onClick={() => openModal('notifM')}
          title="Notifications"
        >
          <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor">
            <path d="M28.7 19.3L26 16.6V13a10 10 0 00-8-9.8V2h-4v1.2A10 10 0 006 13v3.6l-2.7 2.7A1 1 0 004 21h7a5 5 0 0010 0h7a1 1 0 00.7-1.7zM16 23a3 3 0 01-3-2h6a3 3 0 01-3 2z" />
          </svg>
        </button>
        <button
          style={{ width: 44, height: 48, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tp)' }}
          onClick={logout}
          title="Sign out"
        >
          <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor">
            <path d="M12 4H4v24h8v-2H6V6h6zm8 18l-1.5-1.5L22 17H10v-2h12l-3.5-3.5L20 10l6 6z" />
          </svg>
        </button>
        <div className="cvs-header-av" style={{ background: session.color }}>{initials}</div>
      </div>

      {/* Notifications modal inline */}
      <NotificationsModal />
    </header>
  );
}

function NotificationsModal() {
  const { modals, closeModal } = useApp();
  if (!modals['notifM']) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(22,22,22,.5)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) closeModal('notifM'); }}>
      <div style={{ background: 'var(--l1)', border: '1px solid var(--bs)', width: 480, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '13px 20px', borderBottom: '1px solid var(--bs)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 600, fontFamily: "'IBM Plex Sans Condensed',sans-serif" }}>Notifications</div>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }} onClick={() => closeModal('notifM')}>×</button>
        </div>
        <div style={{ padding: 0, overflowY: 'auto', flex: 1 }}>
          {[
            { icon: '🚨', color: 'var(--er)', title: 'THRESHOLD ALERT — Sh-14 at 90%', time: '5 minutes ago' },
            { icon: '✓', color: 'var(--ok)', title: 'PC-0038 paid — $250 via InnBucks', time: '2 hours ago' },
            { icon: '⚠', color: 'var(--wa-t)', title: 'FastFix Repairs pending verification', time: '3 hours ago' },
            { icon: 'ℹ', color: 'var(--info)', title: 'Cron reconciliation complete', time: 'Today 00:01' },
          ].map((n, i) => (
            <div key={i} style={{ padding: '11px 18px', borderBottom: '1px solid var(--bs)', display: 'flex', gap: 10 }}>
              <div style={{ color: n.color, fontSize: 15 }}>{n.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{n.title}</div>
                <div style={{ fontSize: 11, color: 'var(--ts)', marginTop: 1 }}>{n.time}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '13px 20px', borderTop: '1px solid var(--bs)', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="ab pri" style={{ height: 42, padding: '0 20px' }} onClick={() => closeModal('notifM')}>Mark all read</button>
        </div>
      </div>
    </div>
  );
}
