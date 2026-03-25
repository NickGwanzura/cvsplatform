import { useApp } from '../../context/AppContext';
import { ROLES } from '../../data/mockData';

export default function AppSideNav() {
  const { session, activeNavIdx, navigate } = useApp();
  if (!session) return null;
  const r = ROLES[session.roleKey];

  return (
    <nav style={{
      position: 'fixed', top: 48, left: 0, bottom: 0, width: 256,
      background: 'var(--l1)', borderRight: '1px solid var(--bs)',
      zIndex: 90, overflowY: 'auto', display: 'flex', flexDirection: 'column'
    }}>
      <div className="cvs-nav-label">{r.label.toUpperCase()}</div>
      {r.nav.map((item, i) => (
        <div
          key={i}
          onClick={() => navigate(item, i)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
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
  );
}
