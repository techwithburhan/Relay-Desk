import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as api from '../api/client';
import './License.css';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate('/'), 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="license-page">
      <div className="license-card">
        <div className="license-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="10" width="16" height="10" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
        </div>
        <h1>Reset Password</h1>

        {done ? (
          <div className="license-message success">Password updated. Redirecting to login…</div>
        ) : (
          <>
            <p>Choose a new password for your account.</p>
            <form onSubmit={handleSubmit}>
              <input
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
              {error && <div className="license-message error">{error}</div>}
              <button className="btn-signin" type="submit" disabled={loading}>
                {loading ? 'Saving…' : 'Reset Password'}
              </button>
            </form>
          </>
        )}

        <p style={{ marginTop: 20 }}>
          <Link to="/" style={{ color: '#1C8CFF', fontWeight: 600, fontSize: 13 }}>Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
