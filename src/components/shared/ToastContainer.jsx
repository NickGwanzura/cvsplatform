import { useApp } from '../../context/AppContext';

const ICONS = { ok: '✓', er: '✕', wa: '⚠', info: 'ℹ' };

export default function ToastContainer() {
  const { toasts, dismissToast } = useApp();
  return (
    <div id="cvs-toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`cvs-toast ${t.type}`}>
          <div className="toast-icon">{ICONS[t.type] || 'ℹ'}</div>
          <div className="toast-body">
            <div className="toast-title">{t.title}</div>
            {t.sub && <div className="toast-sub">{t.sub}</div>}
          </div>
          <button className="toast-x" onClick={() => dismissToast(t.id)}>×</button>
        </div>
      ))}
    </div>
  );
}
