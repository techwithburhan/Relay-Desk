import { useEffect, useState } from 'react';
import PageShell from '../components/PageShell';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/client';
import './AdminCrud.css';

const emptyForm = { id: null, name: '', location: '', manualNumber: '' };

export default function AdminBranches() {
  const { token, agent } = useAuth();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const refresh = () => api.getBranches(token).then(setBranches).finally(() => setLoading(false));

  useEffect(() => { refresh(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (agent?.role !== 'admin') {
    return (
      <PageShell>
        <Topbar title="Branch Management" />
        <div className="admin-crud-status error">Only an admin can manage branches.</div>
      </PageShell>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      if (form.id) {
        await api.updateBranch(token, form.id, { name: form.name, location: form.location, manualNumber: form.manualNumber });
        setMessage({ type: 'success', text: 'Branch updated.' });
      } else {
        await api.createBranch(token, { name: form.name, location: form.location, manualNumber: form.manualNumber });
        setMessage({ type: 'success', text: 'Branch created.' });
      }
      setForm(emptyForm);
      refresh();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (b) => {
    setForm({ id: b.id, name: b.name, location: b.location, manualNumber: b.manual_number || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (b) => {
    if (!window.confirm(`Delete branch "${b.name}"? Agents/customers linked to it must be reassigned first.`)) return;
    try {
      await api.deleteBranch(token, b.id);
      refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleStatus = async (b) => {
    await api.updateBranch(token, b.id, { status: b.status === 'enabled' ? 'disabled' : 'enabled' });
    refresh();
  };

  return (
    <PageShell>
      <Topbar title="Branch Management" subtitle="Add, edit, and enable/disable branch locations." showExport={false} />

      <div className="panel admin-crud-form">
        <div className="panel-title">{form.id ? 'Edit Branch' : 'Add New Branch'}</div>
        <form onSubmit={handleSubmit}>
          <div className="form-row-split">
            <div className="form-row">
              <label>Branch Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Relay Desk — Jaipur" required />
            </div>
            <div className="form-row">
              <label>Branch Location</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Jaipur" required />
            </div>
          </div>
          <div className="form-row">
            <label>Manual Branch Number</label>
            <input type="text" value={form.manualNumber} onChange={(e) => setForm({ ...form, manualNumber: e.target.value })} placeholder="e.g. BR-004" />
          </div>

          {message && <div className={`save-message ${message.type}`}>{message.text}</div>}

          <div className="form-actions">
            {form.id && <button type="button" className="btn btn-outline" onClick={() => setForm(emptyForm)}>Cancel Edit</button>}
            <button type="submit" className="btn btn-navy" disabled={saving}>{saving ? 'Saving…' : form.id ? 'Update Branch' : 'Add Branch'}</button>
          </div>
        </form>
      </div>

      {loading && <div className="admin-crud-status">Loading branches…</div>}

      {!loading && (
        <div className="panel admin-crud-list">
          <div className="panel-title">Branches ({branches.length})</div>
          {branches.map((b) => (
            <div className="admin-crud-row" key={b.id}>
              <div className="row-main">
                <div className="row-title">{b.name} <span className="mono" style={{ color: 'var(--ink-400)', fontWeight: 400 }}>#{b.id}</span></div>
                <div className="row-sub">{b.location} · Branch No: {b.manual_number || '—'}</div>
              </div>
              <span className={`status-chip ${b.status === 'enabled' ? 'enabled' : 'disabled'}`}>{b.status}</span>
              <button className="btn btn-outline" type="button" onClick={() => handleToggleStatus(b)}>
                {b.status === 'enabled' ? 'Disable' : 'Enable'}
              </button>
              <button className="btn btn-outline" type="button" onClick={() => handleEdit(b)}>Edit</button>
              <button className="btn-danger" type="button" onClick={() => handleDelete(b)}>Delete</button>
            </div>
          ))}
          {branches.length === 0 && <div className="admin-crud-status">No branches yet.</div>}
        </div>
      )}
    </PageShell>
  );
}
