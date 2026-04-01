import { useApp } from '../../context/AppContext';
import { ROLES } from '../../data/mockData';

export default function AppHeader() {
  const { session, headerTitle, openModal, navOpen, setNavOpen, currency, toggleCurrency } = useApp();
  if (!session) return null;
  const r = ROLES[session.roleKey];

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 48,
      background: 'var(--l1)', borderBottom: '1px solid var(--bs)',
      display: 'flex', alignItems: 'center', zIndex: 100, padding: '0 16px', gap: 12
    }}>
      {/* Hamburger — mobile only */}
      <button className="cvs-hamburger" onClick={() => setNavOpen(o => !o)} title="Menu" aria-label="Toggle navigation">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
          {navOpen
            ? <path d="M14 4l-10 10M4 4l10 10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            : <><rect y="3" width="18" height="1.5"/><rect y="8.25" width="18" height="1.5"/><rect y="13.5" width="18" height="1.5"/></>}
        </svg>
      </button>
      <div className="cvs-header-sq" style={{ background: session.color }}>{session.code}</div>
      <div className="cvs-header-brand">
        <div className="cvs-header-nm">Cash Verification System</div>
        <div className="cvs-header-sub">{session.brand} — {r.label}</div>
      </div>
      <div className="cvs-header-divider" />
      <div className="cvs-header-title">{headerTitle}</div>
      <div style={{ flex: 1 }} />

      {/* Currency toggle */}
      <button
        onClick={toggleCurrency}
        title={`Switch to ${currency === 'USD' ? 'ZWL' : 'USD'}`}
        style={{
          height: 30, padding: '0 10px', border: '1px solid var(--bs)', borderRadius: 4,
          background: 'var(--l2)', cursor: 'pointer', fontSize: 11, fontWeight: 700,
          fontFamily: "'IBM Plex Mono',monospace", color: currency === 'USD' ? 'var(--ok-t)' : 'var(--wa-t)',
          display: 'flex', alignItems: 'center', gap: 4, transition: 'all .15s',
        }}
      >
        {currency === 'USD' ? 'USD' : 'ZWL'}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>
      </button>
      <div className="cvs-header-divider" />
      <button
        className="cvs-notif-btn"
        onClick={() => openModal('notifM')}
        title="Notifications"
      >
        <svg width="22" height="22" viewBox="0 0 32 32" fill="currentColor">
          <path d="M28.7 19.3L26 16.6V13a10 10 0 00-8-9.8V2h-4v1.2A10 10 0 006 13v3.6l-2.7 2.7A1 1 0 004 21h7a5 5 0 0010 0h7a1 1 0 00.7-1.7zM16 23a3 3 0 01-3-2h6a3 3 0 01-3 2z" />
        </svg>
        <span className="cvs-notif-pulse" />
      </button>

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
          <button className="ab pri lg" onClick={() => closeModal('notifM')}>Mark all read</button>
        </div>
      </div>
    </div>
  );
}
