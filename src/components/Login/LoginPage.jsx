import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ROLES, DEMO_USERS } from '../../data/mockData';

export default function LoginPage() {
  const { session, login } = useApp();
  const [selected, setSelected] = useState(null);
  const [showErr, setShowErr] = useState(false);

  const pickRole = (u) => {
    setSelected(u);
    setShowErr(false);
  };

  const doLogin = () => {
    if (!selected) { setShowErr(true); return; }
    const roleData = ROLES[selected.role];
    login(selected.role, roleData);
  };

  const email = selected
    ? selected.name.toLowerCase().replace(' ', '.') + '@simbisa.co.zw'
    : '';

  return (
    <div className={`lg-wrap${session ? ' out' : ''}`}>
      <div className="lg-l">
        <div>
          <div className="lg-h">Cashless.<br />Verified.<br /><em>Instant.</em></div>
          <div className="lg-p">
            End-to-end petty cash automation powered by InnBucks across all Simbisa brands. Built with the IBM Carbon Design System.
          </div>
        </div>

      </div>

      <div className="lg-r">
        <div className="lg-card">
          <div className="lc-h">Sign In to CVS</div>
          <div className="lc-s">Select a demo role to explore</div>
          <div style={{ fontSize: 10, color: 'var(--ts)', fontFamily: "'IBM Plex Mono',monospace", textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>
            Demo Roles
          </div>
          <div className="role-grid">
            {DEMO_USERS.map(u => (
              <button
                key={u.role}
                className={`rc${selected?.role === u.role ? ' sel' : ''}`}
                onClick={() => pickRole(u)}
              >
                <div className="rc-role">{u.label}</div>
                <div className="rc-name">{u.name}</div>
                <div className="rc-brand">{u.brand}</div>
              </button>
            ))}
          </div>
          <div className="lf">
            <label className="ll">Email</label>
            <input className="li" type="email" value={email} readOnly placeholder="name@simbisa.co.zw" />
          </div>
          <div className="lf">
            <label className="ll">Password</label>
            <input className="li" type="password" defaultValue="demo1234" readOnly />
          </div>
          <button className="lg-btn" onClick={doLogin}>
            Sign In
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M11.7 7l-4-4L9 1.6 14.4 7 9 12.4 7.7 11l4-4H2V5h9.7z" />
            </svg>
          </button>
          <div className={`lerr${showErr ? ' show' : ''}`}>Please select a role.</div>
        </div>
      </div>
    </div>
  );
}
