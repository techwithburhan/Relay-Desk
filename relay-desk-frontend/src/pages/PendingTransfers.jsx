import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/PageShell';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/client';
import './AdminCrud.css';

export default function PendingTransfers() {
  const { token, agent } = useAuth();
  const navigate = useNavigate();
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = () => {
    setLoading(true);
    api.getPendingTransfers(token).then(setTransfers).catch((e) => setError(e.message)).finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (agent?.role === 'client') {
    return (
      <PageShell>
        <Topbar title="Pending Transfers" />
        <div className="admin-crud-status error">This page is only available to Admin and Dealer accounts.</div>
      </PageShell>
    );
  }

  const handleAccept = async (t) => {
    await api.acceptTransfer(token, t.id);
    refresh();
  };
  const handleReject = async (t) => {
    if (!window.confirm('Reject this transfer request?')) return;
    await api.rejectTransfer(token, t.id);
    refresh();
  };

  return (
    <PageShell>
      <Topbar title="Pending Transfers" subtitle="Ticket transfer requests waiting for your department's approval." showExport={false} />

      {loading && <div className="admin-crud-status">Loading requests…</div>}
      {error && <div className="admin-crud-status error">{error}</div>}

      {!loading && !error && (
        <div className="panel admin-crud-list">
          <div className="panel-title">Pending Requests ({transfers.length})</div>
          {transfers.map((t) => (
            <div className="admin-crud-row" key={t.id}>
              <div className="row-main">
                <div className="row-title">
                  <span className="mono">#{t.ticket_number}</span> — {t.subject}
                </div>
                <div className="row-sub">
                  {t.from_department_name || 'Unassigned'} → <b>{t.to_department_name}</b> · requested {new Date(t.created_at).toLocaleString()}
                </div>
              </div>
              <button className="btn btn-outline" type="button" onClick={() => navigate(`/tickets/${t.ticket_number}`)}>View</button>
              <button className="btn btn-teal" type="button" onClick={() => handleAccept(t)}>Accept</button>
              <button className="btn-danger" type="button" onClick={() => handleReject(t)}>Reject</button>
            </div>
          ))}
          {transfers.length === 0 && <div className="admin-crud-status">No pending transfer requests right now.</div>}
        </div>
      )}
    </PageShell>
  );
}
