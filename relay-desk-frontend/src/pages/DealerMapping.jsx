import { useEffect, useState } from 'react';
import PageShell from '../components/PageShell';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import './AdminCrud.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function DealerMapping() {
  const { token, agent } = useAuth();
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const authedFetch = (path, opts = {}) =>
    fetch(`${API_URL}${path}`, {
      ...opts,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
    }).then((r) => r.json());

  const refresh = () => authedFetch('/agents/dealers').then(setDealers).finally(() => setLoading(false));

  useEffect(() => { refresh(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (agent?.role !== 'admin') {
    return (
      <PageShell>
        <Topbar title="Dealer Mapping" />
        <div className="admin-crud-status error">Only an admin can manage dealer mapping.</div>
      </PageShell>
    );
  }

  const toggleAccess = async (d) => {
    await authedFetch(`/agents/${d.id}/access`, { method: 'PATCH', body: JSON.stringify({ active: !d.active }) });
    refresh();
  };

  const resetPassword = async (d) => {
    const res = await authedFetch(`/agents/${d.id}/reset-password`, { method: 'POST' });
    setMessage({ type: 'success', text: `New temp password for ${d.name}: ${res.tempPassword}` });
    setTimeout(() => setMessage(null), 8000);
  };

  return (
    <PageShell>
      <Topbar title="Dealer Mapping" subtitle="Manage dealer logins, branches, and access." showExport={false} />

      {message && <div className={`save-message ${message.type}`}>{message.text}</div>}

      {loading && <div className="admin-crud-status">Loading dealers…</div>}

      {!loading && (
        <div className="panel admin-crud-list">
          <div className="panel-title">Dealers ({dealers.length})</div>
          {dealers.map((d) => (
            <div className="admin-crud-row" key={d.id}>
              <div className="row-main">
                <div className="row-title">{d.name} <span className="mono" style={{ color: 'var(--ink-400)', fontWeight: 400 }}>#{d.id}</span></div>
                <div className="row-sub">
                  {d.email} · {d.branch_name} ({d.branch_location}) · Last login: {d.last_login_at ? new Date(d.last_login_at).toLocaleString() : 'Never'}
                </div>
              </div>
              <span className={`status-chip ${d.active ? 'enabled' : 'disabled'}`}>{d.active ? 'Login Allowed' : 'Login Disabled'}</span>
              <button className="btn btn-outline" type="button" onClick={() => toggleAccess(d)}>
                {d.active ? 'Disable Login' : 'Allow Login'}
              </button>
              <button className="btn btn-outline" type="button" onClick={() => resetPassword(d)}>Reset Password</button>
            </div>
          ))}
          {dealers.length === 0 && <div className="admin-crud-status">No dealers found.</div>}
        </div>
      )}
    </PageShell>
  );
}
