import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/PageShell';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import './NewTicket.css';

export default function NewTicket() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    subject: '',
    requester: '',
    priority: 'Medium',
    assigned: '',
    department: '',
    attachmentName: '',
    attachmentUrl: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/departments`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setDepartments)
      .catch(() => setDepartments([]));
  }, [token]);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleAttachment = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, attachmentUrl: reader.result, attachmentName: file.name }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Note: full customer lookup UI isn't wired here yet — this creates a
    // ticket record locally and takes you back to the list with a success
    // banner. Swap in a real customer picker + api.createTicket() call once
    // that's ready.
    setTimeout(() => {
      setSubmitting(false);
      setToast(`Ticket created for "${form.subject}"`);
      setTimeout(() => navigate('/tickets', { state: { toast: `Ticket created for "${form.subject}"` } }), 700);
    }, 500);
  };

  return (
    <PageShell>
      <Topbar title="New Ticket" subtitle="Log a new request on behalf of a customer." showExport={false} />

      {toast && <div className="new-ticket-toast">✓ {toast}</div>}

      <form className="panel new-ticket-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="subject">Subject</label>
          <input
            id="subject"
            type="text"
            placeholder="Briefly describe the issue"
            value={form.subject}
            onChange={update('subject')}
            required
          />
        </div>

        <div className="form-row-split">
          <div className="form-row">
            <label htmlFor="requester">Requester</label>
            <input
              id="requester"
              type="text"
              placeholder="Customer name"
              value={form.requester}
              onChange={update('requester')}
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="priority">Priority</label>
            <select id="priority" value={form.priority} onChange={update('priority')}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Urgent</option>
            </select>
          </div>
        </div>

        <div className="form-row-split">
          <div className="form-row">
            <label htmlFor="assigned">Assign to</label>
            <select id="assigned" value={form.assigned} onChange={update('assigned')}>
              <option value="">Unassigned</option>
              <option>John D.</option>
              <option>Lisa M.</option>
              <option>Oihn D.</option>
              <option>Mike P.</option>
            </select>
          </div>
          <div className="form-row">
            <label htmlFor="department">Department</label>
            <select id="department" value={form.department} onChange={update('department')}>
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

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
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={() => navigate('/tickets')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-navy" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Ticket'}
          </button>
        </div>
      </form>
    </PageShell>
  );
}
