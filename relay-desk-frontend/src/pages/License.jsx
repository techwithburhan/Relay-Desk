import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../api/client';
import './License.css';

export default function License() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api.getLicenseStatus().then(setStatus).catch(() => setStatus({ active: false }));
  }, []);

  const handleActivate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const result = await api.activateLicense(licenseKey.trim());
      setMessage({ type: 'success', text: `License activated. Valid until ${new Date(result.expiresAt).toLocaleDateString()}.` });
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="license-page">
      <div className="license-card">
        <div className="license-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 9h18M8 15h4" />
          </svg>
        </div>

        {status?.active ? (
          <>
            <h1>License Active</h1>
            <p>Your license is valid until <b>{new Date(status.expiresAt).toLocaleDateString()}</b>.</p>
            <button className="btn-signin" type="button" onClick={() => navigate('/')}>
              Go to Login
            </button>
          </>
        ) : (
          <>
            <h1>License Expired</h1>
            <p>Please contact your administrator, or enter a new license key below to reactivate this portal.</p>

            <form onSubmit={handleActivate}>
              <input
                type="text"
                placeholder="Enter license key (e.g. AAAA-BBBB-CCCC)"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                required
              />
              {message && <div className={`license-message ${message.type}`}>{message.text}</div>}
              <button className="btn-signin" type="submit" disabled={loading}>
                {loading ? 'Activating…' : 'Activate License'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
