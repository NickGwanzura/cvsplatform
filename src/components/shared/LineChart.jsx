import { useId } from 'react';

export default function LineChart({ data, color = '#0f62fe', height = 140, prefix = '$', multiline = false }) {
  const uid = useId().replace(/:/g, '');
  const gradId = `lg-${uid}`;

  if (!data || (Array.isArray(data[0]) ? data[0].length < 2 : data.length < 2)) return null;

  const W = 700, H = height;
  const pad = { top: 16, right: 20, bottom: 28, left: 58 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;

  // Single-line mode: data = [{ label, value }]
  // Multi-line mode:  data = [{ label, lines: { name, value, color }[] }]
  const isSingle = !multiline;

  const allVals = isSingle
    ? data.map(d => d.value)
    : data.flatMap(d => d.lines.map(l => l.value));
  const max = Math.max(...allVals);
  const min = 0;
  const range = max - min || 1;

  const px = (i) => pad.left + (i / (data.length - 1)) * iW;
  const py = (v) => pad.top + ((max - v) / range) * iH;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({
    y: pad.top + t * iH,
    val: Math.round(max * (1 - t)),
  }));

  const renderSingle = () => {
    const points = data.map((d, i) => `${px(i)},${py(d.value)}`).join(' ');
    const areaPath = [
      `M${px(0)},${py(data[0].value)}`,
      ...data.slice(1).map((d, i) => `L${px(i + 1)},${py(d.value)}`),
      `L${px(data.length - 1)},${pad.top + iH}`,
      `L${px(0)},${pad.top + iH}`, 'Z',
    ].join(' ');
    return (
      <>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradId})`} />
        <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={px(i)} cy={py(d.value)} r="4.5" fill={color} />
            <circle cx={px(i)} cy={py(d.value)} r="2" fill="white" />
          </g>
        ))}
      </>
    );
  };

  const renderMulti = () => {
    const lineKeys = data[0].lines.map(l => ({ name: l.name, color: l.color }));
    return lineKeys.map(({ name, color: lc }) => {
      const pts = data.map((d, i) => {
        const l = d.lines.find(x => x.name === name);
        return l ? `${px(i)},${py(l.value)}` : null;
      }).filter(Boolean).join(' ');
      return (
        <polyline key={name} points={pts} fill="none" stroke={lc} strokeWidth="2" strokeLinejoin="round" opacity="0.85" />
      );
    });
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height, display: 'block' }}>
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={pad.left} x2={W - pad.right} y1={t.y} y2={t.y} stroke="var(--bs)" strokeWidth="1" />
          <text x={pad.left - 8} y={t.y + 4} textAnchor="end" fontSize="10" fill="var(--ts)" fontFamily="'IBM Plex Mono',monospace">
            {prefix}{t.val.toLocaleString()}
          </text>
        </g>
      ))}
      {isSingle ? renderSingle() : renderMulti()}
      {data.map((d, i) => (
        <text key={i} x={px(i)} y={H - 4} textAnchor="middle" fontSize="10" fill="var(--ts)" fontFamily="'IBM Plex Mono',monospace">
          {d.label}
        </text>
      ))}
    </svg>
  );
}
