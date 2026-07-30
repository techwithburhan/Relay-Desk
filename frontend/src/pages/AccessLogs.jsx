import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import PageShell from '../components/PageShell';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/client';
import '../components/RecentTickets.css';
import './AccessLogs.css';

const actionClass = {
  login: 'log-login',
  login_failed: 'log-failed',
  logout: 'log-logout',
  session_timeout: 'log-timeout',
};

const RANGE_OPTIONS = [
  { value: '', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7', label: 'Last 7 Days' },
  { value: 'last30', label: 'Last 30 Days' },
  { value: 'custom', label: 'Custom Range' },
];

export default function AccessLogs() {
  const { token, agent } = useAuth();
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [range, setRange] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = () => {
    setLoading(true);
    const params = { page, pageSize: 20 };
    if (range) params.range = range;
    if (range === 'custom' && from && to) { params.from = from; params.to = to; }
    if (search) params.search = search;

    api.getLogs(token, params)
      .then((data) => {
        setLogs(data.logs);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(fetchLogs, [page, range, from, to]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const toggleSelect = (id) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };
  const toggleSelectAll = () => {
    setSelected(selected.length === logs.length ? [] : logs.map((l) => l.id));
  };

  const handleDeleteOne = async (id) => {
    if (!window.confirm('Delete this log entry?')) return;
    await api.deleteLog(token, id);
    fetchLogs();
  };

  const handleDeleteSelected = async () => {
    if (!selected.length) return;
    if (!window.confirm(`Delete ${selected.length} selected log(s)?`)) return;
    await api.deleteLogs(token, selected);
    setSelected([]);
    fetchLogs();
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Delete ALL access logs? This cannot be undone.')) return;
    await api.deleteAllLogs(token);
    setSelected([]);
    fetchLogs();
  };

  const handleExport = () => {
    const rows = logs.map((l) => ({
      Email: l.agent_email,
      Role: l.agent_role,
      Action: l.action,
      'IP Address': l.ip_address || '',
      'Date/Time': new Date(l.created_at).toLocaleString(),
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Access Logs');
    XLSX.writeFile(workbook, `relay-desk-access-logs-${Date.now()}.xlsx`);
  };

  if (agent?.role !== 'admin') {
    return (
      <PageShell>
        <Topbar title="Access Logs" />
        <div className="downloads-status error">Only an admin can view access logs.</div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Topbar title="Access Logs" subtitle="Every login, logout, and session event across the app." showExport={false} />

      <div className="panel recent-tickets">
        <div className="panel-head">
          <div>
            <div className="panel-title">Access Log</div>
            <div className="panel-sub">{total} total events</div>
          </div>
          <div className="chip-row">
            <button className="btn btn-teal" type="button" onClick={handleExport} disabled={!logs.length}>
              Export to Excel
            </button>
            <button className="btn btn-danger" type="button" onClick={handleDeleteSelected} disabled={!selected.length}>
              Delete Selected ({selected.length})
            </button>
            <button className="btn btn-danger" type="button" onClick={handleDeleteAll} disabled={!total}>
              Delete All
            </button>
          </div>
        </div>

        <div className="logs-filter-row">
          <select value={range} onChange={(e) => { setRange(e.target.value); setPage(1); }}>
            {RANGE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          {range === 'custom' && (
            <>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </>
          )}
          <form onSubmit={handleSearchSubmit} className="logs-search-form">
            <input
              type="text"
              placeholder="Search by email, role, or action…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-outline">Search</button>
          </form>
        </div>

        {loading && <div className="downloads-status">Loading logs…</div>}
        {error && <div className="downloads-status error">{error}</div>}

        {!loading && !error && (
          <>
            <table>
              <thead>
                <tr>
                  <th><input type="checkbox" checked={selected.length === logs.length && logs.length > 0} onChange={toggleSelectAll} /></th>
                  <th>Email</th><th>Role</th><th>Action</th><th>IP Address</th><th>Date / Time</th><th></th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td><input type="checkbox" checked={selected.includes(l.id)} onChange={() => toggleSelect(l.id)} /></td>
                    <td>{l.agent_email}</td>
                    <td style={{ textTransform: 'capitalize' }}>{l.agent_role}</td>
                    <td><span className={`log-pill ${actionClass[l.action] || ''}`}>{l.action.replace('_', ' ')}</span></td>
                    <td className="mono">{l.ip_address || '—'}</td>
                    <td>{new Date(l.created_at).toLocaleString()}</td>
                    <td><button className="btn-danger" type="button" onClick={() => handleDeleteOne(l.id)}>Delete</button></td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--ink-400)', padding: '20px' }}>No logs found.</td></tr>
                )}
              </tbody>
            </table>

            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 7).map((n) => (
                <div key={n} className={`page-btn${page === n ? ' active' : ''}`} onClick={() => setPage(n)}>{n}</div>
              ))}
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}
