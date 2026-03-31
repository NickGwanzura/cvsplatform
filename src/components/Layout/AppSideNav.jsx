import { useApp } from '../../context/AppContext';
import { ROLES } from '../../data/mockData';

export default function AppSideNav() {
  const { session, activeNavIdx, navigate, navOpen, setNavOpen, logout } = useApp();
  if (!session) return null;
  const r = ROLES[session.roleKey];
  const initials = session.name.split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <>
      {/* Mobile backdrop */}
      {navOpen && (
        <div
          className="cvs-nav-backdrop"
          onClick={() => setNavOpen(false)}
        />
      )}
      <nav className={`cvs-sidenav${navOpen ? ' open' : ''}`}>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div className="cvs-nav-label">{r.label.toUpperCase()}</div>
          {r.nav.map((item, i) => (
            <div
              key={i}
              onClick={() => navigate(item, i)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                cursor: 'pointer', fontSize: 13, transition: 'all .1s',
                borderLeft: i === activeNavIdx ? '3px solid var(--int)' : '3px solid transparent',
                background: i === activeNavIdx ? 'var(--hl)' : 'none',
                color: i === activeNavIdx ? 'var(--info)' : 'var(--ts)',
                fontWeight: i === activeNavIdx ? 500 : 400,
              }}
            >
              <span style={{ flex: 1 }}>{item.lb}</span>
              {item.badge && (
                <span className={`cvs-nav-badge${item.alert ? ' alert' : item.live ? ' live' : ''}`}>
                  {item.badge}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Profile section at bottom */}
        <div className="cvs-nav-profile">
          <div className="cvs-nav-profile-info">
            <div className="cvs-nav-profile-avatar" style={{ background: session.color }}>{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="cvs-nav-profile-name">{session.name}</div>
              <div className="cvs-nav-profile-role">{r.label}</div>
            </div>
          </div>
          <button className="cvs-nav-logout" onClick={logout} title="Sign out">
            <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor">
              <path d="M12 4H4v24h8v-2H6V6h6zm8 18l-1.5-1.5L22 17H10v-2h12l-3.5-3.5L20 10l6 6z" />
            </svg>
          </button>
        </div>
      </nav>
    </>
  );
}
