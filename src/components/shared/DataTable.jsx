import { useState } from 'react';

/**
 * Interactive DataTable with optional bar graph columns.
 * 
 * Props:
 * - columns: [{ label, key, barKey?, barMax? }]
 *   - barKey: if provided, renders a bar graph in this cell using data[barKey] as the value
 *   - barMax: max value for bar percentage (auto-calculated from data if not provided)
 * - data: array of objects
 * - renderCell: optional (row, col) => ReactNode override
 * - onRowClick: optional (row) => void
 * - maxRows: optional limit
 */
export default function DataTable({ columns = [], data = [], renderCell, onRowClick, maxRows }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const autoBarMaxes = {};
  columns.forEach(col => {
    if (col.barKey) {
      const vals = data.map(r => Math.abs(Number(r[col.barKey]) || 0));
      autoBarMaxes[col.barKey] = col.barMax ?? Math.max(...vals, 1);
    }
  });

  let sorted = [...data];
  if (sortKey) {
    sorted.sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      const na = typeof va === 'number' ? va : parseFloat(String(va).replace(/[^0-9.-]/g, '')) || 0;
      const nb = typeof vb === 'number' ? vb : parseFloat(String(vb).replace(/[^0-9.-]/g, '')) || 0;
      return sortDir === 'asc' ? na - nb : nb - na;
    });
  }

  if (maxRows) sorted = sorted.slice(0, maxRows);

  return (
    <table className="dt">
      <thead>
        <tr>
          {columns.map(col => (
            <th
              key={col.key}
              onClick={() => col.key && handleSort(col.key)}
              style={{ cursor: col.key ? 'pointer' : 'default', userSelect: 'none' }}
            >
              {col.label}
              {sortKey === col.key && (
                <span style={{ marginLeft: 4, fontSize: 8 }}>{sortDir === 'asc' ? '▲' : '▼'}</span>
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sorted.length === 0 ? (
          <tr><td colSpan={columns.length} style={{ textAlign: 'center', color: 'var(--ts)', padding: 20 }}>No data matches the selected filters.</td></tr>
        ) : (
          sorted.map((row, ri) => (
            <tr
              key={row.id || ri}
              onClick={() => onRowClick?.(row)}
              style={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {columns.map(col => (
                <td key={col.key}>
                  {renderCell ? renderCell(row, col) : (
                    col.barKey ? (
                      <div className="dt-bar-cell">
                        <div className="dt-bar-track">
                          <div className="dt-bar-fill" style={{ width: `${Math.min(100, (Math.abs(Number(row[col.barKey]) || 0) / autoBarMaxes[col.barKey]) * 100)}%` }} />
                        </div>
                        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11 }}>{row[col.barKey]}</span>
                      </div>
                    ) : (
                      row[col.key]
                    )
                  )}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
