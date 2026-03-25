import { useApp } from '../../context/AppContext';
import { ROLES } from '../../data/mockData';

export default function AppSideNav() {
  const { session, activeNavIdx, navigate, navOpen, setNavOpen } = useApp();
  if (!session) return null;
  const r = ROLES[session.roleKey];

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
      </nav>
    </>
  );
}
