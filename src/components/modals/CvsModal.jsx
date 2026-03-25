/** Generic CVS modal wrapper — matches original visual style */
export default function CvsModal({ id, open, onClose, title, subtitle, size = 'md', children, footer }) {
  if (!open) return null;
  const widths = { sm: 480, md: 560, lg: 800, xl: 960 };
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(22,22,22,.5)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--l1)', border: '1px solid var(--bs)',
        width: widths[size], maxWidth: '92vw', maxHeight: '88vh',
        display: 'flex', flexDirection: 'column',
        animation: 'su .17s ease'
      }}>
        <div style={{ padding: '13px 20px', borderBottom: '1px solid var(--bs)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, fontFamily: "'IBM Plex Sans Condensed',sans-serif" }}>{title}</div>
            {subtitle && <div style={{ fontSize: 11, color: 'var(--ts)', marginTop: 2 }}>{subtitle}</div>}
          </div>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ts)', fontSize: 20, lineHeight: 1, padding: 0 }} onClick={onClose}>×</button>
        </div>
        <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
        {footer && (
          <div style={{ padding: '13px 20px', borderTop: '1px solid var(--bs)', display: 'flex', justifyContent: 'flex-end', gap: 0, flexShrink: 0 }}>
            {footer}
          </div>
        )}
      </div>
      <style>{`@keyframes su{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
    </div>
  );
}
