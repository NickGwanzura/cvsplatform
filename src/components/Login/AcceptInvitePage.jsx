import { useState, useMemo } from 'react';
import { acceptInvite } from '../../lib/cvsApi';

export default function AcceptInvitePage() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const valid = password.length >= 8 && password === confirm && !!token;

  const submit = async (e) => {
    e.preventDefault();
    if (!valid || loading) return;
    setError('');
    setLoading(true);
    try {
      await acceptInvite({ token, password, password_confirmation: confirm });
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
      setError(fieldMsg || data?.message || err.message || 'Could not accept invitation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lg-wrap">
      <div className="lg-l">
        <div>
          <div className="lg-h">Welcome.<br />Set your password.</div>
          <div className="lg-p">
            You've been invited to the Cash Verification System. Choose a password to activate your account.
          </div>
        </div>
      </div>

      <div className="lg-r">
        <form className="lg-card" onSubmit={submit}>
          <div className="lc-h">Accept Invitation</div>
          <div className="lc-s">Create your password to finish setup</div>

          {!token && (
            <div style={{ marginTop: 10, padding: 10, background: 'var(--er-bg)', borderLeft: '3px solid var(--er)', fontSize: 12, color: 'var(--er-t)' }}>
              Missing or invalid invitation token. Ask your administrator to resend the invite.
            </div>
          )}

          <div className="lf">
            <label className="ll" htmlFor="invite-password">New password</label>
            <input
              id="invite-password"
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
            <label className="ll" htmlFor="invite-confirm">Confirm new password</label>
            <input
              id="invite-confirm"
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
            {done ? 'Account activated — redirecting…' : loading ? 'Activating…' : 'Activate account'}
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
