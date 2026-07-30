import { useEffect, useState } from 'react';
import PageShell from '../components/PageShell';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/client';
import './AdminCrud.css';

export default function AdminLicense() {
  const { token, agent } = useAuth();
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [validityDays, setValidityDays] = useState(30);
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const refresh = () => api.getLicenses(token).then(setLicenses).finally(() => setLoading(false));

  useEffect(() => { refresh(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (agent?.role !== 'admin') {
    return (
      <PageShell>
        <Topbar title="License Management" />
        <div className="admin-crud-status error">Only an admin can manage licenses.</div>
      </PageShell>
    );
  }

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await api.generateLicense(token, Number(validityDays));
      refresh();
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async (id) => {
    if (!window.confirm('Revoke this license? Any portal using it will be blocked immediately.')) return;
    await api.revokeLicense(token, id);
    refresh();
  };

  const handleCopy = (key, id) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const isExpired = (l) => new Date(l.expires_at) < new Date();

  return (
    <PageShell>
      <Topbar title="License Management" subtitle="Generate, view, and revoke portal licenses." showExport={false} />

      <div className="panel admin-crud-form">
        <div className="panel-title">Generate New License</div>
        <div className="form-row-split">
          <div className="form-row">
            <label>Validity (days)</label>
            <input type="number" min="1" value={validityDays} onChange={(e) => setValidityDays(e.target.value)} />
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn-navy" type="button" onClick={handleGenerate} disabled={generating}>
            {generating ? 'Generating…' : 'Generate License'}
          </button>
        </div>
      </div>

      {loading && <div className="admin-crud-status">Loading licenses…</div>}

      {!loading && (
        <div className="panel admin-crud-list">
          <div className="panel-title">All Licenses</div>
          {licenses.length === 0 && <div className="admin-crud-status">No licenses generated yet.</div>}
          {licenses.map((l) => {
            const expired = isExpired(l);
            const effectiveStatus = l.status === 'active' && expired ? 'expired' : l.status;
            return (
              <div className="admin-crud-row" key={l.id}>
                <div className="row-main">
                  <div className="row-title mono">{l.license_key}</div>
                  <div className="row-sub">
                    Issued {new Date(l.issued_at).toLocaleDateString()} · Expires {new Date(l.expires_at).toLocaleDateString()}
                  </div>
                </div>
                <span className={`status-chip ${effectiveStatus === 'active' ? 'enabled' : 'disabled'}`}>
                  {effectiveStatus}
                </span>
                <button className="btn btn-outline" type="button" onClick={() => handleCopy(l.license_key, l.id)}>
                  {copiedId === l.id ? 'Copied!' : 'Copy'}
                </button>
                {l.status === 'active' && (
                  <button className="btn btn-danger" type="button" onClick={() => handleRevoke(l.id)}>Revoke</button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
