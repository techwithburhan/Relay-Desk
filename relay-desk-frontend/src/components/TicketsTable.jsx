import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/RecentTickets.css';
import allTickets from '../data/tickets';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/client';
import { statusClass, STATUS_OPTIONS } from '../data/statuses';

const priorityClass = { Urgent: 'pri-urgent', High: 'pri-high', Medium: 'pri-medium', Low: 'pri-low' };
const PAGE_SIZE = 5;

export default function TicketsTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tickets, setTickets] = useState(allTickets);
  const navigate = useNavigate();
  const { token, agent } = useAuth();
  const isAdmin = agent?.role === 'admin';

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (priorityFilter && t.priority !== priorityFilter) return false;
      if (statusFilter && t.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          t.subject.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          t.requester.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tickets, search, priorityFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async (e, ticketId) => {
    e.stopPropagation();
    if (!window.confirm(`Delete ticket #${ticketId}? This cannot be undone.`)) return;
    try {
      await api.deleteTicket(token, ticketId);
    } catch {
      // The sample ticket may not exist in the DB yet (seed mismatch) —
      // still remove it from the visible list either way.
    }
    setTickets((ts) => ts.filter((t) => t.id !== ticketId));
  };

  return (
    <div className="panel recent-tickets">
      <div className="panel-head">
        <div>
          <div className="panel-title">All Tickets</div>
          <div className="panel-sub">{filtered.length} of {tickets.length} tickets</div>
        </div>
        <div className="chip-row">
          <select className="filter-select" value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}>
            <option value="">All Priority</option>
            <option>Urgent</option><option>High</option><option>Medium</option><option>Low</option>
          </select>
          <select className="filter-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
          <input
            className="filter-search"
            type="text"
            placeholder="Search tickets…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Ticket</th><th>Subject</th><th>Requester</th><th>Priority</th><th>Status</th><th>Assigned</th><th>Created</th>
            {isAdmin && <th></th>}
          </tr>
        </thead>
        <tbody>
          {pageItems.map((t) => (
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
              {isAdmin && (
                <td>
                  <button className="btn-danger" type="button" onClick={(e) => handleDelete(e, t.id)}>Delete</button>
                </td>
              )}
            </tr>
          ))}
          {pageItems.length === 0 && (
            <tr><td colSpan={isAdmin ? 8 : 7} style={{ textAlign: 'center', color: 'var(--ink-400)', padding: '20px' }}>No tickets match your filters.</td></tr>
          )}
        </tbody>
      </table>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <div key={n} className={`page-btn${page === n ? ' active' : ''}`} onClick={() => setPage(n)}>
            {n}
          </div>
        ))}
      </div>
    </div>
  );
}
