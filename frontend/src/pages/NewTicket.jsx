import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/PageShell';
import Topbar from '../components/Topbar';
import ConfettiBurst from '../components/ConfettiBurst';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/client';
import './NewTicket.css';

export default function NewTicket() {
  const navigate = useNavigate();
  const { token, agent } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState({
    requesterName: agent?.role === 'client' ? agent?.name || '' : '',
    priority: 'Medium',
    departmentId: '',
    branchId: '',
    attachmentName: '',
    attachmentUrl: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    api.getDepartments(token).then(setDepartments).catch(() => setDepartments([]));
    api.getBranches(token).then((all) => setBranches(all.filter((b) => b.status !== 'disabled'))).catch(() => setBranches([]));
  }, [token]);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const selectedDept = departments.find((d) => String(d.id) === String(form.departmentId));
  const isBranchDept = selectedDept?.name === 'Branch';

  const handleAttachment = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, attachmentUrl: reader.result, attachmentName: file.name }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (isBranchDept && !form.branchId) {
      setError('Please select a Branch Location.');
      return;
    }

    setSubmitting(true);
    try {
      const { ticketNumber } = await api.createTicket(token, {
        subject: form.description?.slice(0, 80) || 'New support request',
        requesterName: form.requesterName,
        description: form.description,
        priority: form.priority,
        departmentId: form.departmentId ? Number(form.departmentId) : null,
        branchId: isBranchDept ? Number(form.branchId) : null,
        customerId: agent?.role === 'client' ? agent.customerId : undefined,
        attachmentUrl: form.attachmentUrl || undefined,
        attachmentName: form.attachmentName || undefined,
      });

      setShowConfetti(true);
      setTimeout(() => {
        navigate(`/tickets/${ticketNumber}`, {
          state: { toast: '🎉 Ticket Created Successfully! We will update the status ASAP.' },
        });
      }, 1800);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <PageShell>
      <Topbar title="New Ticket" subtitle="Log a new request." showExport={false} />

      {showConfetti && <ConfettiBurst />}

      {showConfetti ? (
        <div className="ticket-success-banner">
          <div className="ticket-success-emoji">🎉</div>
          <h2>Ticket Created Successfully!</h2>
          <p>Your request has been submitted successfully. We will update the status as soon as possible (ASAP).</p>
        </div>
      ) : (
        <form className="panel new-ticket-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="requesterName">Full Name</label>
            <input
              id="requesterName"
              type="text"
              placeholder="Your full name"
              value={form.requesterName}
              onChange={update('requesterName')}
              readOnly={agent?.role === 'client'}
              required
            />
          </div>

          <div className="form-row-split">
            <div className="form-row">
              <label htmlFor="priority">Priority</label>
              <select id="priority" value={form.priority} onChange={update('priority')}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>
            <div className="form-row">
              <label htmlFor="department">Department</label>
              <select id="department" value={form.departmentId} onChange={update('departmentId')} required>
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          {isBranchDept && (
            <div className="form-row">
              <label htmlFor="branchLocation">Branch Location</label>
              <input
                list="branch-options"
                id="branchLocation"
                placeholder="Search or select a branch…"
                value={branches.find((b) => String(b.id) === String(form.branchId))?.location || ''}
                onChange={(e) => {
                  const match = branches.find((b) => b.location.toLowerCase() === e.target.value.toLowerCase());
                  setForm((f) => ({ ...f, branchId: match ? match.id : '' }));
                }}
              />
              <datalist id="branch-options">
                {branches.map((b) => <option key={b.id} value={b.location} />)}
              </datalist>
            </div>
          )}

          <div className="form-row">
            <label className="upload-btn">
              Attach a file (optional)
              <input type="file" onChange={handleAttachment} hidden />
            </label>
            {form.attachmentName && <span className="uploaded-tag">{form.attachmentName} ✓</span>}
          </div>

          <div className="form-row">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              rows={5}
              placeholder="What happened? Include any steps to reproduce."
              value={form.description}
              onChange={update('description')}
              required
            />
          </div>

          {error && <div className="new-ticket-toast error">{error}</div>}

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/tickets')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-navy" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create Ticket'}
            </button>
          </div>
        </form>
      )}
    </PageShell>
  );
}
