export default function BetaPill() {
  return (
    <div
      aria-label="Beta"
      title="Beta — features may change"
      style={{
        position: 'fixed',
        bottom: 12,
        right: 12,
        zIndex: 9999,
        padding: '3px 10px',
        background: '#24a148',
        color: '#fff',
        fontSize: 10,
        fontWeight: 700,
        fontFamily: "'IBM Plex Mono', monospace",
        letterSpacing: '.08em',
        borderRadius: 999,
        boxShadow: '0 1px 3px rgba(0,0,0,.18)',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      BETA
    </div>
  );
}
