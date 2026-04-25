export default function EndpointPendingBanner({ endpoints, feature, note, style }) {
  const list = Array.isArray(endpoints) ? endpoints : [endpoints];
  return (
    <div className="ntf wa" style={{ marginBottom: 12, ...style }}>
      <div>
        <div className="ntf-t">Backend endpoint not yet wired</div>
        <div className="ntf-b">
          {feature ? `${feature} is waiting on ` : 'Waiting on '}
          {list.map((e, i) => (
            <span key={e}>
              <code style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--wa-t)' }}>{e}</code>
              {i < list.length - 1 ? ', ' : ''}
            </span>
          ))}
          . This screen will light up once the API ships — showing empty state for now.
          {note && (
            <div style={{ marginTop: 6, fontSize: 11, color: 'var(--ts)', fontStyle: 'italic' }}>{note}</div>
          )}
        </div>
      </div>
    </div>
  );
}
