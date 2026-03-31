import { useApp } from '../../context/AppContext';

export default function Breadcrumbs({ items = [] }) {
  const { navigate } = useApp();
  return (
    <div className="bc">
      {items.map((item, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {i > 0 && <span className="bc-sep">/</span>}
          {item.nav ? (
            <button
              className="bc-link"
              onClick={() => navigate(item.nav, item.navIdx ?? 0)}
            >
              {item.label}
            </button>
          ) : (
            <span className={i === items.length - 1 ? 'bc-current' : 'bc-text'}>{item.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}
