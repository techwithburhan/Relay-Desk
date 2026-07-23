import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RecentTickets.css';
import allTickets from '../data/tickets';
import { statusClass } from '../data/statuses';

const tickets = allTickets.slice(0, 5);

const priorityClass = {
  Urgent: 'pri-urgent',
  High: 'pri-high',
  Medium: 'pri-medium',
  Low: 'pri-low',
};


export default function RecentTickets() {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  return (
    <div className="panel recent-tickets">
      <div className="panel-head">
        <div>
          <div className="panel-title">Recent Tickets</div>
          <div className="panel-sub">Newest activity across the queue</div>
        </div>
        <div className="chip-row">
          <div className="chip">Priority ▾</div>
          <div className="chip">Status ▾</div>
          <div className="chip">Filter ▾</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Ticket</th><th>Subject</th><th>Requester</th><th>Priority</th><th>Status</th><th>Assigned</th><th>Created</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => (
            <tr key={t.id} className="clickable-row" onClick={() => navigate(`/tickets/${t.id}`)}>
              <td className="tid mono">#{t.id}</td>
              <td>{t.subject}</td>
              <td>{t.requester}</td>
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
                  {t.assigned}
                </div>
              </td>
              <td>{t.created}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={`page-btn${page === n ? ' active' : ''}`}
            onClick={() => setPage(n)}
          >
            {n}
          </div>
        ))}
        <div className="page-btn">›</div>
        <div className="page-btn">»</div>
      </div>
    </div>
  );
}
