import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RecentTickets.css';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/client';
import { statusClass } from '../data/statuses';

const priorityClass = {
  Urgent: 'pri-urgent',
  High: 'pri-high',
  Medium: 'pri-medium',
  Low: 'pri-low',
};

export default function RecentTickets() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTickets(token)
      .then((all) => setTickets(all.slice(0, 5)))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="panel recent-tickets">
      <div className="panel-head">
        <div>
          <div className="panel-title">Recent Tickets</div>
          <div className="panel-sub">Newest activity across the queue</div>
        </div>
      </div>

      {loading && <div className="downloads-status">Loading…</div>}

      {!loading && (
        <table>
          <thead>
            <tr>
              <th>Ticket</th><th>Subject</th><th>Requester</th><th>Priority</th><th>Status</th><th>Assigned</th><th>Created</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.ticket_number} className="clickable-row" onClick={() => navigate(`/tickets/${t.ticket_number}`)}>
                <td className="tid mono">#{t.ticket_number}</td>
                <td>{t.subject}</td>
                <td>{t.requester_name}</td>
                <td>
                  <span className={`pill ${priorityClass[t.priority]}`}>
                    <span className="pill-dot" />
                    {t.priority}
                  </span>
                </td>
                <td className={statusClass[t.status]}>{t.status}</td>
                <td>
                  <div className="who">
                    <div className="who-dot" />
                    {t.assigned_name || 'Unassigned'}
                  </div>
                </td>
                <td>{new Date(t.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--ink-400)', padding: '20px' }}>No tickets yet.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
