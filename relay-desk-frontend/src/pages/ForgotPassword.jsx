import { useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api/client';
import './License.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.forgotPassword(email);
      setResult(res);
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
        <h1>Forgot Password</h1>
        <p>Enter your account email and we'll generate a password reset link.</p>

        {!result && (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {error && <div className="license-message error">{error}</div>}
            <button className="btn-signin" type="submit" disabled={loading}>
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
          </form>
        )}

        {result && (
          <>
            <div className="license-message success">{result.message}</div>
            {/* No email provider is wired up yet — show the link directly so
                this flow is fully testable end-to-end during development. */}
            {result.resetUrl && (
              <p style={{ wordBreak: 'break-all', fontSize: 12 }}>
                <Link to={result.resetUrl.replace(window.location.origin, '')}>{result.resetUrl}</Link>
              </p>
            )}
          </>
        )}

        <p style={{ marginTop: 20 }}>
          <Link to="/" style={{ color: '#1C8CFF', fontWeight: 600, fontSize: 13 }}>Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
