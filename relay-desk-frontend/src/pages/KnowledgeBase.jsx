import { useEffect, useState } from 'react';
import PageShell from '../components/PageShell';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/client';
import './KnowledgeBase.css';

const emptyForm = { id: null, title: '', category: '', content: '', url: '' };

export default function KnowledgeBase() {
  const { token, agent } = useAuth();
  const isAdmin = agent?.role === 'admin';
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const refresh = () => api.getArticles(token).then(setArticles).finally(() => setLoading(false));

  useEffect(() => { refresh(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (form.id) {
        await api.updateArticle(token, form.id, form);
      } else {
        await api.createArticle(token, form);
      }
      setForm(emptyForm);
      setShowForm(false);
      refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (a) => {
    setForm({ id: a.id, title: a.title, category: a.category, content: a.content || '', url: a.url || '' });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this article?')) return;
    await api.deleteArticle(token, id);
    refresh();
  };

  return (
    <PageShell>
      <Topbar title="Knowledge Base" subtitle="Help articles your team and customers can reference." showExport={false} />

      {isAdmin && (
        <div className="panel kb-admin-panel">
          <div className="panel-head">
            <div className="panel-title">{form.id ? 'Edit Article' : 'Add Article'}</div>
            <button className="btn btn-outline" type="button" onClick={() => { setShowForm((s) => !s); setForm(emptyForm); }}>
              {showForm ? 'Cancel' : '+ Add Article'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="kb-form">
              <div className="form-row-split">
                <div className="form-row">
                  <label>Title</label>
                  <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="form-row">
                  <label>Category</label>
                  <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
                </div>
              </div>
              <div className="form-row">
                <label>Content</label>
                <textarea rows={3} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Read More URL</label>
                <input type="text" placeholder="https://…" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-navy" disabled={saving}>{saving ? 'Saving…' : 'Save Article'}</button>
              </div>
            </form>
          )}
        </div>
      )}

      {loading && <div className="downloads-status">Loading articles…</div>}

      <div className="kb-grid">
        {articles.map((a) => (
          <div className="kb-card" key={a.id}>
            <span className="kb-category">{a.category}</span>
            <h3 className="kb-title">{a.title}</h3>
            {a.content && <p className="kb-content">{a.content}</p>}
            <div className="kb-meta">{a.views} views</div>
            <div className="kb-actions">
              {a.url && (
                <a href={a.url} target="_blank" rel="noreferrer" className="btn btn-teal kb-readmore">Read More</a>
              )}
              {isAdmin && (
                <>
                  <button className="btn btn-outline" type="button" onClick={() => handleEdit(a)}>Edit</button>
                  <button className="btn-danger" type="button" onClick={() => handleDelete(a.id)}>Delete</button>
                </>
              )}
            </div>
          </div>
        ))}
        {!loading && articles.length === 0 && <div className="downloads-status">No articles yet.</div>}
      </div>
    </PageShell>
  );
}
