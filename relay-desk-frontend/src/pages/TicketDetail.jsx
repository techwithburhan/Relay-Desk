import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import PageShell from '../components/PageShell';
import TicketTimeline from '../components/TicketTimeline';
import { getTicketById } from '../data/tickets';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/client';
import { STATUS_OPTIONS, statusClass } from '../data/statuses';
import './TicketDetail.css';

const priorityClass = {
  Urgent: 'pri-urgent',
  High: 'pri-high',
  Medium: 'pri-medium',
  Low: 'pri-low',
};

export default function TicketDetail() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { agent, token } = useAuth();
  const ticket = getTicketById(ticketId);
  const isAdmin = agent?.role === 'admin';

  const [status, setStatus] = useState(ticket?.status);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

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
      await api.updateTicketStatus(token, ticket.id, { status: newStatus });
      setStatusMessage({ type: 'success', text: 'Status updated.' });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Only an admin can change ticket status.' });
      setStatus(ticket.status); // revert on failure
    } finally {
      setSaving(false);
    }
  };

  if (!ticket) {
    return (
      <PageShell>
        <div className="td-not-found">
          <h2>Ticket not found</h2>
          <p>We couldn't find a ticket with that ID.</p>
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

        <div className="td-header">
          <div className="td-id mono">#{ticket.id}</div>
          <h1 className="td-subject display">{ticket.subject}</h1>
        </div>

        <div className="td-meta-row">
          <span className={`pill ${priorityClass[ticket.priority]}`}>
            <span className="pill-dot" />
            {ticket.priority}
          </span>

          {isAdmin ? (
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
                <span className="td-value">{ticket.requester}</span>
              </div>
              <div className="td-field">
                <span className="td-label">Assigned to</span>
                <span className="td-value">{ticket.assigned}</span>
              </div>
              <div className="td-field">
                <span className="td-label">Raised on</span>
                <span className="td-value">{ticket.createdAt}</span>
              </div>
              <div className="td-field">
                <span className="td-label">Last updated</span>
                <span className="td-value">{ticket.updatedAt}</span>
              </div>
              {isAdmin && ticket.branchLocation && (
                <div className="td-field">
                  <span className="td-label">Branch / Location</span>
                  <span className="td-value">{ticket.branchLocation}</span>
                </div>
              )}
            </div>

            <div className="td-section">
              <div className="td-section-title">Issue details</div>
              <p className="td-description">{ticket.description}</p>
            </div>

            <div className="td-section">
              <div className="td-section-title">Activity</div>

              {lastComment && (
                <div className="td-last-comment">
                  Last comment from <b>{lastComment.author}</b> · {lastComment.time}
                </div>
              )}

              <div className="comment-thread">
                {(ticket.comments || []).map((c, i) => (
                  <div className="comment-row" key={i}>
                    <div className="comment-avatar" />
                    <div className="comment-body">
                      <div className="comment-top">
                        <span className="comment-author">{c.author}</span>
                        <span className="comment-time">{c.time}</span>
                      </div>
                      <p className="comment-text">{c.text}</p>
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
