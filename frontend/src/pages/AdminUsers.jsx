import { useEffect, useState } from 'react';
import PageShell from '../components/PageShell';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/client';
import './AdminCrud.css';

const emptyForm = {
  name: '', email: '', role: 'dealer', branchId: '', departmentId: '',
  branchNumber: '', canChangeStatus: true, password: '',
};

export default function AdminUsers() {
  const { token, agent } = useAuth();
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const refresh = () => api.getAgents(token).then(setUsers).finally(() => setLoading(false));

  useEffect(() => {
    refresh();
    api.getBranches(token).then(setBranches).catch(() => setBranches([]));
    api.getDepartments(token).then(setDepartments).catch(() => setDepartments([]));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (agent?.role !== 'admin') {
    return (
      <PageShell>
        <Topbar title="User Management" />
        <div className="admin-crud-status error">Only an admin can manage users.</div>
      </PageShell>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await api.createAgent(token, {
        name: form.name,
        email: form.email,
        role: form.role,
        branchId: form.branchId ? Number(form.branchId) : undefined,
        departmentId: form.departmentId ? Number(form.departmentId) : undefined,
        branchNumber: form.branchNumber || undefined,
        canChangeStatus: form.canChangeStatus,
        password: form.password || undefined,
      });
      setMessage({
        type: 'success',
        text: `User created.${res.tempPassword ? ` Temporary password: ${res.tempPassword}` : ''}`,
      });
      setForm(emptyForm);
      refresh();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Delete user "${u.name}"? This cannot be undone.`)) return;
    await api.deleteAgent(token, u.id);
    refresh();
  };

  const handleToggleStatusPermission = async (u) => {
    await api.setStatusPermission(token, u.id, !u.can_change_status);
    refresh();
  };

  return (
    <PageShell>
      <Topbar title="User Management" subtitle="Add or remove Admin, Dealer, and Client logins." showExport={false} />

      <div className="panel admin-crud-form">
        <div className="panel-title">Add New User</div>
        <form onSubmit={handleSubmit}>
          <div className="form-row-split">
            <div className="form-row">
              <label>Full name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-row">
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
          </div>

          <div className="form-row-split">
            <div className="form-row">
              <label>Role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="admin">Admin</option>
                <option value="dealer">Dealer</option>
                <option value="client">Client</option>
              </select>
            </div>
            <div className="form-row">
              <label>Department (optional — e.g. Accounts, IT)</label>
              <select value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}>
                <option value="">No department</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>

          {form.role !== 'admin' && (
            <div className="form-row-split">
              <div className="form-row">
                <label>Branch (searchable){form.role === 'client' ? ' *' : ''}</label>
                <input
                  list="user-branch-options"
                  value={branches.find((b) => String(b.id) === String(form.branchId))?.location || ''}
                  onChange={(e) => {
                    const match = branches.find((b) => b.location.toLowerCase() === e.target.value.toLowerCase());
                    setForm((f) => ({ ...f, branchId: match ? match.id : '' }));
                  }}
                  placeholder="Search branch location…"
                  required={form.role === 'client'}
                />
                <datalist id="user-branch-options">
                  {branches.map((b) => <option key={b.id} value={b.location} />)}
                </datalist>
                {form.role === 'client' && (
                  <span style={{ fontSize: 11, color: 'var(--ink-400)' }}>
                    Required for Client logins — used to auto-create their customer record.
                  </span>
                )}
              </div>
              <div className="form-row">
                <label>Manual Branch Number</label>
                <input type="text" value={form.branchNumber} onChange={(e) => setForm({ ...form, branchNumber: e.target.value })} placeholder="e.g. BR-002" />
              </div>
            </div>
          )}

          <div className="form-row">
            <label>Password (optional — defaults to password123)</label>
            <input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>

          <label className="role-check" style={{ marginBottom: 14 }}>
            <input type="checkbox" checked={form.canChangeStatus} onChange={(e) => setForm({ ...form, canChangeStatus: e.target.checked })} />
            <span>Allow this user to change ticket status</span>
          </label>

          {message && <div className={`save-message ${message.type}`}>{message.text}</div>}

          <div className="form-actions">
            <button type="submit" className="btn btn-navy" disabled={saving}>{saving ? 'Creating…' : 'Add User'}</button>
          </div>
        </form>
      </div>

      {loading && <div className="admin-crud-status">Loading users…</div>}

      {!loading && (
        <div className="panel admin-crud-list">
          <div className="panel-title">All Users ({users.length})</div>
          {users.map((u) => (
            <div className="admin-crud-row" key={u.id}>
              <div className="row-main">
                <div className="row-title">{u.name} <span className="mono" style={{ color: 'var(--ink-400)', fontWeight: 400 }}>#{u.id}</span></div>
                <div className="row-sub">
                  {u.email} · {u.department_name ? `Dept: ${u.department_name}` : ''}
                  {u.branch_location ? ` · Branch: ${u.branch_location}${u.branch_manual_number ? ` (${u.branch_manual_number})` : ''}` : ''}
                </div>
              </div>
              <span className={`status-chip ${u.role === 'admin' ? 'enabled' : 'disabled'}`} style={{ textTransform: 'capitalize' }}>{u.role}</span>
              {u.role !== 'admin' && (
                <button className="btn btn-outline" type="button" onClick={() => handleToggleStatusPermission(u)}>
                  {u.can_change_status ? 'Status: Editable' : 'Status: Read-only'}
                </button>
              )}
              <button className="btn-danger" type="button" onClick={() => handleDelete(u)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
