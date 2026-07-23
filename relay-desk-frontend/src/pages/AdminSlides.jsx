import { useEffect, useState } from 'react';
import PageShell from '../components/PageShell';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/client';
import './AdminCrud.css';

const MAX_SLIDES = 4;

const emptyForm = {
  id: null,
  imageUrl: '',
  title: '',
  subtitle: '',
  description: '',
  buttonText: '',
  buttonUrl: '',
};

export default function AdminSlides() {
  const { token, agent } = useAuth();
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const refresh = () => api.getAllSlidesAdmin(token).then(setSlides).finally(() => setLoading(false));

  useEffect(() => { refresh(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (agent?.role !== 'admin') {
    return (
      <PageShell>
        <Topbar title="Login Slider Management" />
        <div className="admin-crud-status error">Only an admin can manage the login slider.</div>
      </PageShell>
    );
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, imageUrl: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!form.id && slides.length >= MAX_SLIDES) {
      setMessage({ type: 'error', text: `Maximum ${MAX_SLIDES} slides allowed. Delete one before adding another.` });
      return;
    }

    setSaving(true);
    try {
      if (form.id) {
        await api.updateSlide(token, form.id, form);
        setMessage({ type: 'success', text: 'Slide updated.' });
      } else {
        await api.createSlide(token, form);
        setMessage({ type: 'success', text: 'Slide created.' });
      }
      setForm(emptyForm);
      refresh();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (s) => {
    setForm({
      id: s.id,
      imageUrl: s.image_url || '',
      title: s.title || '',
      subtitle: s.subtitle || '',
      description: s.description || '',
      buttonText: s.button_text || '',
      buttonUrl: s.button_url || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this slide?')) return;
    await api.deleteSlide(token, id);
    refresh();
  };

  const handleToggleStatus = async (s) => {
    await api.updateSlide(token, s.id, { status: s.status === 'enabled' ? 'disabled' : 'enabled' });
    refresh();
  };

  const move = async (index, direction) => {
    const newOrder = [...slides];
    const swapWith = index + direction;
    if (swapWith < 0 || swapWith >= newOrder.length) return;
    [newOrder[index], newOrder[swapWith]] = [newOrder[swapWith], newOrder[index]];
    setSlides(newOrder);
    await api.reorderSlides(token, newOrder.map((s) => s.id));
  };

  return (
    <PageShell>
      <Topbar title="Login Slider Management" subtitle={`Manage the slides shown on the login page (max ${MAX_SLIDES}).`} showExport={false} />

      <div className="panel admin-crud-form">
        <div className="panel-title">{form.id ? 'Edit Slide' : `Add New Slide (${slides.length}/${MAX_SLIDES})`}</div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label className="upload-btn">
              Upload Image
              <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
            </label>
            {form.imageUrl && <span className="uploaded-tag">Image attached ✓</span>}
          </div>

          <div className="form-row-split">
            <div className="form-row">
              <label>Title</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="form-row">
              <label>Subtitle</label>
              <input type="text" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
            </div>
          </div>

          <div className="form-row">
            <label>Description</label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="form-row-split">
            <div className="form-row">
              <label>Button Text (optional)</label>
              <input type="text" value={form.buttonText} onChange={(e) => setForm({ ...form, buttonText: e.target.value })} />
            </div>
            <div className="form-row">
              <label>Button URL (optional)</label>
              <input type="text" value={form.buttonUrl} onChange={(e) => setForm({ ...form, buttonUrl: e.target.value })} />
            </div>
          </div>

          {message && <div className={`save-message ${message.type}`}>{message.text}</div>}

          <div className="form-actions">
            {form.id && (
              <button type="button" className="btn btn-outline" onClick={() => setForm(emptyForm)}>Cancel Edit</button>
            )}
            <button type="submit" className="btn btn-navy" disabled={saving || (!form.id && slides.length >= MAX_SLIDES)}>
              {saving ? 'Saving…' : form.id ? 'Update Slide' : 'Add Slide'}
            </button>
          </div>
        </form>
      </div>

      {loading && <div className="admin-crud-status">Loading slides…</div>}

      {!loading && (
        <div className="panel admin-crud-list">
          <div className="panel-title">Slides ({slides.length}/{MAX_SLIDES})</div>
          {slides.length === 0 && <div className="admin-crud-status">No slides yet — add one above.</div>}
          {slides.map((s, i) => (
            <div className="admin-crud-row" key={s.id}>
              <div className="row-icon" style={{ background: s.image_url ? undefined : undefined }}>
                {s.image_url ? <img src={s.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 9 }} /> : '—'}
              </div>
              <div className="row-main">
                <div className="row-title">{s.title || '(no title)'}</div>
                <div className="row-sub">{s.subtitle}</div>
              </div>
              <span className={`status-chip ${s.status}`}>{s.status}</span>
              <button className="btn btn-outline" type="button" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
              <button className="btn btn-outline" type="button" onClick={() => move(i, 1)} disabled={i === slides.length - 1}>↓</button>
              <button className="btn btn-outline" type="button" onClick={() => handleToggleStatus(s)}>
                {s.status === 'enabled' ? 'Disable' : 'Enable'}
              </button>
              <button className="btn btn-outline" type="button" onClick={() => handleEdit(s)}>Edit</button>
              <button className="btn btn-danger" type="button" onClick={() => handleDelete(s.id)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
