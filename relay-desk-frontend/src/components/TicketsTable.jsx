import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/RecentTickets.css';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/client';
import { statusClass, STATUS_OPTIONS } from '../data/statuses';

const priorityClass = { Urgent: 'pri-urgent', High: 'pri-high', Medium: 'pri-medium', Low: 'pri-low' };
const PAGE_SIZE = 8;

export default function TicketsTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { token, agent } = useAuth();
  const isAdmin = agent?.role === 'admin';
  const canDelete = agent?.role === 'admin';

  const refresh = () => {
    setLoading(true);
    api.getTickets(token)
      .then(setTickets)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  // Real data from the database — this is what makes delete actually
  // persist across a page reload, instead of coming back from a static
  // sample file.
  useEffect(() => { refresh(); }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (priorityFilter && t.priority !== priorityFilter) return false;
      if (statusFilter && t.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          t.subject.toLowerCase().includes(q) ||
          t.ticket_number.toLowerCase().includes(q) ||
          (t.requester_name || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tickets, search, priorityFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async (e, ticketNumber) => {
    e.stopPropagation();
    if (!window.confirm(`Delete ticket #${ticketNumber}? This cannot be undone.`)) return;
    try {
      await api.deleteTicket(token, ticketNumber);
      // Re-fetch from the database so the list always reflects what's
      // actually stored — this is why reloading the page won't bring a
      // deleted ticket back.
      refresh();
    } catch (err) {
      alert(err.message);
    }
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

      {loading && <div className="downloads-status">Loading tickets…</div>}
      {error && <div className="downloads-status error">{error}</div>}

      {!loading && !error && (
        <>
          <table>
            <thead>
              <tr>
                <th>Ticket</th><th>Subject</th><th>Requester</th><th>Branch</th><th>Department</th><th>Priority</th><th>Status</th><th>Assigned</th><th>Created</th>
                {canDelete && <th></th>}
              </tr>
            </thead>
            <tbody>
              {pageItems.map((t) => (
                <tr key={t.ticket_number} className="clickable-row" onClick={() => navigate(`/tickets/${t.ticket_number}`)}>
                  <td className="tid mono">#{t.ticket_number}</td>
                  <td>{t.subject}</td>
                  <td>{t.requester_name}</td>
                  <td>{t.branch_location || '—'}</td>
                  <td>{t.department_name || '—'}</td>
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
                  {canDelete && (
                    <td>
                      <button className="btn-danger" type="button" onClick={(e) => handleDelete(e, t.ticket_number)}>Delete</button>
                    </td>
                  )}
                </tr>
              ))}
              {pageItems.length === 0 && (
                <tr><td colSpan={isAdmin ? 10 : 9} style={{ textAlign: 'center', color: 'var(--ink-400)', padding: '20px' }}>No tickets match your filters.</td></tr>
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
        </>
      )}
    </div>
  );
}
