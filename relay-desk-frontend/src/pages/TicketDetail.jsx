import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import gsap from 'gsap';
import PageShell from '../components/PageShell';
import TicketTimeline from '../components/TicketTimeline';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/client';
import { STATUS_OPTIONS, statusClass } from '../data/statuses';
import './TicketDetail.css';

const priorityClass = {
  Urgent: 'pri-urgent',
  Critical: 'pri-urgent',
  High: 'pri-high',
  Medium: 'pri-medium',
  Low: 'pri-low',
};

export default function TicketDetail() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { agent, token } = useAuth();
  const canEdit = agent?.role === 'admin' || agent?.role === 'dealer';
  const [toast, setToast] = useState(location.state?.toast || null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [status, setStatus] = useState('');
  const [remark, setRemark] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [transferToId, setTransferToId] = useState('');
  const [transferring, setTransferring] = useState(false);
  const [transferMessage, setTransferMessage] = useState(null);

  useEffect(() => {
    api.getDepartments(token).then(setDepartments).catch(() => setDepartments([]));
  }, [token]);

  useEffect(() => {
    setLoading(true);
    api.getTicket(token, ticketId)
      .then((data) => {
        setTicket(data);
        setStatus(data.status);
        setRemark(data.remark || '');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token, ticketId]);

  useEffect(() => {
    if (!ticket) return;
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo('.td-back', { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.4 })
      .fromTo('.td-header', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.2')
      .fromTo('.td-meta-row', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4 }, '-=0.25')
      .fromTo('.td-grid', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45 }, '-=0.2')
      .fromTo('.td-section', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.12 }, '-=0.2')
      .fromTo('.comment-row', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.08 }, '-=0.25');
    return () => tl.kill();
  }, [ticket]);

  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus);
    setSaving(true);
    setStatusMessage(null);
    try {
      await api.updateTicketStatus(token, ticket.ticket_number, { status: newStatus });
      setStatusMessage({ type: 'success', text: 'Status updated.' });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
      setStatus(ticket.status);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRemark = async () => {
    setSaving(true);
    setStatusMessage(null);
    try {
      await api.updateTicketStatus(token, ticket.ticket_number, { remark });
      setStatusMessage({ type: 'success', text: 'Remark saved.' });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const refreshTicket = () => {
    api.getTicket(token, ticketId).then(setTicket).catch(() => {});
  };

  const handleTransfer = async () => {
    if (!transferToId) return;
    setTransferring(true);
    setTransferMessage(null);
    try {
      const res = await api.requestTicketTransfer(token, ticket.ticket_number, Number(transferToId));
      setTransferMessage({ type: 'success', text: res.message });
      setTransferToId('');
      refreshTicket();
    } catch (err) {
      setTransferMessage({ type: 'error', text: err.message });
    } finally {
      setTransferring(false);
    }
  };

  if (loading) {
    return (
      <PageShell>
        <div className="td-not-found"><h2>Loading ticket…</h2></div>
      </PageShell>
    );
  }

  if (error || !ticket) {
    return (
      <PageShell>
        <div className="td-not-found">
          <h2>Ticket not found</h2>
          <p>{error || "We couldn't find a ticket with that ID."}</p>
          <Link to="/tickets" className="btn btn-navy">Back to Tickets</Link>
        </div>
      </PageShell>
    );
  }

  const lastComment = ticket.comments?.[ticket.comments.length - 1];

  return (
    <PageShell>
      <div className="ticket-detail">
        <button className="td-back" onClick={() => navigate('/tickets')} type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back to Tickets
        </button>

        {toast && <div className="new-ticket-toast">✓ {toast}</div>}

        <div className="td-header">
          <div className="td-id mono">#{ticket.ticket_number}</div>
          <h1 className="td-subject display">{ticket.subject}</h1>
        </div>

        <div className="td-meta-row">
          <span className={`pill ${priorityClass[ticket.priority]}`}>
            <span className="pill-dot" />
            {ticket.priority}
          </span>

          {canEdit ? (
            <div className="status-editor">
              <select
                className={`status-select ${statusClass[status]}`}
                value={status}
                disabled={saving}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {saving && <span className="status-saving">Saving…</span>}
              {statusMessage && (
                <span className={`status-message ${statusMessage.type}`}>{statusMessage.text}</span>
              )}
            </div>
          ) : (
            <span className={`td-status ${statusClass[status]}`}>{status}</span>
          )}
        </div>

        <div className="td-columns">
          <div className="td-main-col">
            <div className="td-grid">
              <div className="td-field">
                <span className="td-label">Requester</span>
                <span className="td-value">{ticket.requester_name}</span>
              </div>
              <div className="td-field">
                <span className="td-label">Assigned to</span>
                <span className="td-value">{ticket.assigned_name || 'Unassigned'}</span>
              </div>
              <div className="td-field">
                <span className="td-label">Branch</span>
                <span className="td-value">{ticket.branch_name} ({ticket.branch_location})</span>
              </div>
              <div className="td-field">
                <span className="td-label">Department</span>
                <span className="td-value">{ticket.department_name || 'Unassigned'}</span>
              </div>
              <div className="td-field">
                <span className="td-label">Raised on</span>
                <span className="td-value">{new Date(ticket.created_at).toLocaleString()}</span>
              </div>
              <div className="td-field">
                <span className="td-label">Last updated</span>
                <span className="td-value">{new Date(ticket.updated_at).toLocaleString()}</span>
              </div>
            </div>

            <div className="td-section">
              <div className="td-section-title">Issue details</div>
              <p className="td-description">{ticket.description}</p>
            </div>

            {canEdit && (
              <div className="td-section">
                <div className="td-section-title">Internal Remark <span style={{ fontWeight: 400, color: 'var(--ink-400)', fontSize: 11 }}>(not visible to the customer)</span></div>
                <textarea
                  className="td-remark-input"
                  rows={3}
                  placeholder="Add an internal note for your team…"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                />
                <button className="btn btn-outline" type="button" onClick={handleSaveRemark} disabled={saving} style={{ marginTop: 8 }}>
                  Save Remark
                </button>
              </div>
            )}

            {canEdit && (
              <div className="td-section">
                <div className="td-section-title">Transfer Ticket to Another Department</div>
                <div className="transfer-row">
                  <span className="transfer-from">From: <b>{ticket.department_name || 'Unassigned'}</b></span>
                  <span className="transfer-arrow">→</span>
                  <select value={transferToId} onChange={(e) => setTransferToId(e.target.value)}>
                    <option value="">Select department…</option>
                    {departments.filter((d) => d.id !== ticket.department_id).map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <button className="btn btn-teal" type="button" onClick={handleTransfer} disabled={transferring || !transferToId}>
                    {transferring ? 'Sending…' : 'Request Transfer'}
                  </button>
                </div>
                <p className="transfer-note">The ticket only moves once the receiving department accepts the request.</p>
                {transferMessage && <div className={`status-message ${transferMessage.type}`}>{transferMessage.text}</div>}

                {ticket.transfers && ticket.transfers.length > 0 && (
                  <div className="transfer-history">
                    {ticket.transfers.map((t) => (
                      <div className="transfer-history-row" key={t.id}>
                        <span>{t.from_department_name || 'Unassigned'} → {t.to_department_name}</span>
                        <span className={`transfer-status ${t.status}`}>{t.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="td-section">
              <div className="td-section-title">Activity Timeline</div>
              <div className="activity-timeline">
                {(ticket.activity || []).map((a) => (
                  <div className="timeline-entry" key={a.id}>
                    <div className="timeline-date">
                      {new Date(a.created_at).toLocaleDateString()}
                      <span className="timeline-time">{new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="timeline-body">
                      <div className="timeline-actor">{a.performed_by || 'System'}</div>
                      <div className="timeline-desc">{a.description}</div>
                    </div>
                  </div>
                ))}
                {(!ticket.activity || ticket.activity.length === 0) && (
                  <div className="no-comments">No activity recorded yet.</div>
                )}
              </div>
            </div>

            <div className="td-section">
              <div className="td-section-title">Messages by Participant</div>

              {lastComment && (
                <div className="td-last-comment">
                  Last comment from <b>{lastComment.author_name}</b> · {new Date(lastComment.created_at).toLocaleString()}
                </div>
              )}

              <div className="comment-thread">
                {(ticket.comments || []).map((c) => (
                  <div className="comment-row" key={c.id}>
                    <div className="comment-avatar" />
                    <div className="comment-body">
                      <div className="comment-top">
                        <span className="comment-author">{c.author_name}</span>
                        <span className="comment-time">{new Date(c.created_at).toLocaleString()}</span>
                      </div>
                      <p className="comment-text">{c.body}</p>
                    </div>
                  </div>
                ))}
                {(!ticket.comments || ticket.comments.length === 0) && (
                  <div className="no-comments">No comments yet on this ticket.</div>
                )}
              </div>
            </div>
          </div>

          <div className="td-side-col">
            <TicketTimeline ticket={ticket} />
          </div>
        </div>
      </div>
    </PageShell>
  );
}
