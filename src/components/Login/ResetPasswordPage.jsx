import { useState, useMemo } from 'react';
import { completePasswordReset } from '../../lib/cvsApi';

export default function ResetPasswordPage() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const token = params.get('token') || '';
  const emailFromLink = params.get('email') || '';

  const [email, setEmail] = useState(emailFromLink);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const valid =
    email.includes('@') &&
    password.length >= 8 &&
    password === confirm &&
    !!token;

  const submit = async (e) => {
    e.preventDefault();
    if (!valid || loading) return;
    setError('');
    setLoading(true);
    try {
      await completePasswordReset({
        email: email.trim(),
        token,
        password,
        password_confirmation: confirm,
      });
      setDone(true);
      setTimeout(() => {
        window.history.replaceState({}, '', '/');
        window.location.href = '/';
      }, 1500);
    } catch (err) {
      const data = err?.response?.data;
      const fieldMsg = data?.errors
        ? Object.values(data.errors).flat()[0]
        : null;
      setError(fieldMsg || data?.message || err.message || 'Could not reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lg-wrap">
      <div className="lg-l">
        <div>
          <div className="lg-h">Set a new<br />password.</div>
          <div className="lg-p">
            Choose a strong password. You'll be signed in after reset.
          </div>
        </div>
      </div>

      <div className="lg-r">
        <form className="lg-card" onSubmit={submit}>
          <div className="lc-h">Reset Password</div>
          <div className="lc-s">Enter your new password below</div>

          {!token && (
            <div style={{ marginTop: 10, padding: 10, background: 'var(--er-bg)', borderLeft: '3px solid var(--er)', fontSize: 12, color: 'var(--er-t)' }}>
              Missing or invalid reset token. Request a new link from the sign-in page.
            </div>
          )}

          <div className="lf">
            <label className="ll" htmlFor="reset-email">Email</label>
            <input
              id="reset-email"
              className="li"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@simbisa.co.zw"
              disabled={loading || done}
              required
            />
          </div>
          <div className="lf">
            <label className="ll" htmlFor="reset-password">New password</label>
            <input
              id="reset-password"
              className="li"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || done}
              minLength={8}
              required
            />
            <div className="fh" style={{ marginTop: 4, fontSize: 11, color: 'var(--ts)' }}>Minimum 8 characters.</div>
          </div>
          <div className="lf">
            <label className="ll" htmlFor="reset-confirm">Confirm new password</label>
            <input
              id="reset-confirm"
              className="li"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={loading || done}
              minLength={8}
              required
            />
            {confirm && password !== confirm && (
              <div className="fh" style={{ marginTop: 4, fontSize: 11, color: 'var(--er-t)' }}>Passwords don't match.</div>
            )}
          </div>

          <button className="lg-btn" type="submit" disabled={!valid || loading || done}>
            {done ? 'Password updated — redirecting…' : loading ? 'Updating…' : 'Update password'}
          </button>

          <div className={`lerr${error ? ' show' : ''}`}>{error || ' '}</div>

          <div style={{ marginTop: 14, textAlign: 'center' }}>
            <a href="/" style={{ fontSize: 12, color: 'var(--ts)', textDecoration: 'underline' }}>← Back to sign in</a>
          </div>
        </form>
      </div>
    </div>
  );
}
