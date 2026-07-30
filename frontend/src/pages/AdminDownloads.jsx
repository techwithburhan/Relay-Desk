import { useEffect, useState } from 'react';
import PageShell from '../components/PageShell';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/client';
import './AdminCrud.css';

const FILE_TYPES = ['pdf', 'exe', 'zip', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'png', 'jpg'];
const ROLES = ['admin', 'dealer', 'client'];
const CATEGORY_PRESETS = ['Essential Downloads', 'Software Downloads', 'Other Downloads'];

const emptyForm = {
  id: null,
  title: '',
  description: '',
  category: 'Essential Downloads',
  fileType: 'pdf',
  fileUrl: '',
  visibleTo: ['admin', 'dealer', 'client'],
  status: 'enabled',
};

export default function AdminDownloads() {
  const { token, agent } = useAuth();
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const refresh = () => api.getAllDownloadsAdmin(token).then(setDownloads).finally(() => setLoading(false));

  useEffect(() => { refresh(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (agent?.role !== 'admin') {
    return (
      <PageShell>
        <Topbar title="Downloads Management" />
        <div className="admin-crud-status error">Only an admin can manage downloads.</div>
      </PageShell>
    );
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, fileUrl: reader.result }));
    reader.readAsDataURL(file);
  };

  const toggleRole = (role) => {
    setForm((f) => ({
      ...f,
      visibleTo: f.visibleTo.includes(role) ? f.visibleTo.filter((r) => r !== role) : [...f.visibleTo, role],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      if (form.id) {
        await api.updateDownload(token, form.id, form);
        setMessage({ type: 'success', text: 'Download updated.' });
      } else {
        await api.createDownload(token, form);
        setMessage({ type: 'success', text: 'Download created.' });
      }
      setForm(emptyForm);
      refresh();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (d) => {
    setForm({
      id: d.id,
      title: d.title,
      description: d.description || '',
      category: d.category,
      fileType: d.file_type,
      fileUrl: d.file_url,
      visibleTo: d.visible_to.split(','),
      status: d.status,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this download? This cannot be undone.')) return;
    await api.deleteDownload(token, id);
    refresh();
  };

  const handleToggleStatus = async (d) => {
    await api.updateDownload(token, d.id, { status: d.status === 'enabled' ? 'disabled' : 'enabled' });
    refresh();
  };

  const grouped = downloads.reduce((acc, d) => {
    acc[d.category] = acc[d.category] || [];
    acc[d.category].push(d);
    return acc;
  }, {});

  return (
    <PageShell>
      <Topbar title="Downloads Management" subtitle="Create and manage Essential Downloads and Software Downloads." showExport={false} />

      <div className="panel admin-crud-form">
        <div className="panel-title">{form.id ? 'Edit Download' : 'Add New Download'}</div>
        <form onSubmit={handleSubmit}>
          <div className="form-row-split">
            <div className="form-row">
              <label>Download Name</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="form-row">
              <label>Category</label>
              <input
                type="text"
                list="category-presets"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              />
              <datalist id="category-presets">
                {CATEGORY_PRESETS.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>
          </div>

          <div className="form-row">
            <label>Description</label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="form-row-split">
            <div className="form-row">
              <label>File Type</label>
              <select value={form.fileType} onChange={(e) => setForm({ ...form, fileType: e.target.value })}>
                {FILE_TYPES.map((t) => <option key={t} value={t}>{t.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <label>Download URL (or upload a file below)</label>
            <input type="text" placeholder="https://…" value={form.fileUrl.startsWith('data:') ? '' : form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} />
          </div>
          <div className="form-row">
            <label className="upload-btn">
              Upload File
              <input type="file" onChange={handleFileUpload} hidden />
            </label>
            {form.fileUrl.startsWith('data:') && <span className="uploaded-tag">File attached ✓</span>}
          </div>

          <div className="form-row">
            <label>Visible to</label>
            <div className="role-checks">
              {ROLES.map((r) => (
                <label key={r} className="role-check">
                  <input type="checkbox" checked={form.visibleTo.includes(r)} onChange={() => toggleRole(r)} />
                  <span style={{ textTransform: 'capitalize' }}>{r}</span>
                </label>
              ))}
            </div>
          </div>

          {message && <div className={`save-message ${message.type}`}>{message.text}</div>}

          <div className="form-actions">
            {form.id && (
              <button type="button" className="btn btn-outline" onClick={() => setForm(emptyForm)}>Cancel Edit</button>
            )}
            <button type="submit" className="btn btn-navy" disabled={saving || !form.fileUrl}>
              {saving ? 'Saving…' : form.id ? 'Update Download' : 'Add Download'}
            </button>
          </div>
        </form>
      </div>

      {loading && <div className="admin-crud-status">Loading downloads…</div>}

      {!loading && Object.entries(grouped).map(([category, items]) => (
        <div className="panel admin-crud-list" key={category}>
          <div className="panel-title">{category}</div>
          {items.map((d) => (
            <div className="admin-crud-row" key={d.id}>
              <div className={`row-icon ${d.file_type}`}>{d.file_type.toUpperCase()}</div>
              <div className="row-main">
                <div className="row-title">{d.title}</div>
                <div className="row-sub">{d.description || 'No description'} · visible to {d.visible_to.replace(/,/g, ', ')}</div>
              </div>
              <span className={`status-chip ${d.status}`}>{d.status}</span>
              <button className="btn btn-outline" type="button" onClick={() => handleToggleStatus(d)}>
                {d.status === 'enabled' ? 'Disable' : 'Enable'}
              </button>
              <button className="btn btn-outline" type="button" onClick={() => handleEdit(d)}>Edit</button>
              <button className="btn btn-danger" type="button" onClick={() => handleDelete(d.id)}>Delete</button>
            </div>
          ))}
        </div>
      ))}
    </PageShell>
  );
}
