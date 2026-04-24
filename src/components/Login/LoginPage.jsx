import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ROLES } from '../../data/mockData';
import { loginUser, forgotPassword } from '../../lib/cvsApi';
import { normalizeAuth } from '../../lib/authMap';

export default function LoginPage() {
  const { session, login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotState, setForgotState] = useState({ sending: false, msg: '' });

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const raw = await loginUser({ email, password });
      const auth = normalizeAuth(raw);
      if (!auth.token) {
        setError('Login succeeded but no token was returned.');
        return;
      }
      localStorage.setItem('token', auth.token);

      const roleData = ROLES[auth.roleKey];
      if (!roleData) {
        localStorage.removeItem('token');
        setError(`Unknown role "${auth.roleCode || '(none)'}". Contact an administrator.`);
        return;
      }

      login(auth.roleKey, {
        ...roleData,
        name: auth.user.name || auth.user.email || email,
        email: auth.user.email || email,
      });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (err?.response?.status === 401 ? 'Invalid email or password.' : null) ||
        'Unable to sign in. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

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
        <form className="lg-card" onSubmit={submit}>
          <div className="lc-h">Sign In to CVS</div>
          <div className="lc-s">Use your Simbisa credentials</div>

          <div className="lf">
            <label className="ll" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              className="li"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@simbisa.co.zw"
              disabled={loading}
              required
            />
          </div>
          <div className="lf">
            <label className="ll" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              className="li"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <button className="lg-btn" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
            {!loading && (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M11.7 7l-4-4L9 1.6 14.4 7 9 12.4 7.7 11l4-4H2V5h9.7z" />
              </svg>
            )}
          </button>
          <div className={`lerr${error ? ' show' : ''}`}>{error || ' '}</div>

          <div style={{ marginTop: 14, textAlign: 'center' }}>
            {!forgotOpen ? (
              <button
                type="button"
                onClick={() => { setForgotOpen(true); setForgotEmail(email); setForgotState({ sending: false, msg: '' }); }}
                style={{ background: 'none', border: 'none', color: 'var(--int)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}
              >
                Forgot password?
              </button>
            ) : (
              <div style={{ textAlign: 'left' }}>
                <label className="ll" htmlFor="forgot-email" style={{ marginTop: 4 }}>Reset password</label>
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <input
                    id="forgot-email"
                    className="li"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@simbisa.co.zw"
                    disabled={forgotState.sending}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="ab pri"
                    style={{ height: 34, padding: '0 14px' }}
                    disabled={forgotState.sending || !forgotEmail.includes('@')}
                    onClick={async () => {
                      setForgotState({ sending: true, msg: '' });
                      try {
                        await forgotPassword({ email: forgotEmail.trim() });
                        setForgotState({ sending: false, msg: `If an account exists for ${forgotEmail}, a reset link has been emailed.` });
                      } catch (err) {
                        const data = err?.response?.data;
                        const msg = data?.errors?.email?.[0] || data?.message || err.message || 'Failed to send reset email';
                        setForgotState({ sending: false, msg });
                      }
                    }}
                  >
                    {forgotState.sending ? 'Sending…' : 'Send reset link'}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setForgotOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--ts)', fontSize: 11, cursor: 'pointer', marginTop: 6, padding: 0 }}
                >
                  ← Back to sign in
                </button>
                {forgotState.msg && (
                  <div style={{ fontSize: 11, color: 'var(--ts)', marginTop: 6 }}>{forgotState.msg}</div>
                )}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
