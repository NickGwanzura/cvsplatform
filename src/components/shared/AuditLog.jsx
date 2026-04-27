export default function AuditLog({ title, entries }) {
  return (
    <>
      <div className="tbbar"><div className="tbt">{title}</div></div>
      <div style={{ background: 'var(--l1)', border: '1px solid var(--bs)', padding: '8px 14px' }}>
        {entries.map((e, i) => (
          <div className="log-e" key={i}>
            <div className="log-dot" style={{ background: e.color }} />
            <div className="log-time">{e.time}</div>
            <div style={{ flex: 1 }}>
              <div className="log-txt">{e.text}</div>
              <div className="log-user">{e.user}</div>
            </div>
            {e.chip}
          </div>
        ))}
      </div>
    </>
  );
}
