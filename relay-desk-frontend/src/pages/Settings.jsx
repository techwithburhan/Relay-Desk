import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import Topbar from '../components/Topbar';
import LogoutButton from '../components/LogoutButton';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import '../pages/NewTicket.css';
import './Settings.css';

const ADMIN_LINKS = [
  { to: '/admin/downloads', label: 'Downloads Management', desc: 'Manage Essential & Software Downloads' },
  { to: '/admin/slides', label: 'Login Slider', desc: 'Manage login page slides (max 4)' },
  { to: '/admin/license', label: 'License Management', desc: 'Generate, revoke, view license status' },
  { to: '/logs', label: 'Access Logs', desc: 'View, filter, and export login activity' },
];

export default function Settings() {
  const { agent, sessionTimeoutMinutes } = useAuth();
  const branding = useBranding();
  const isAdmin = agent?.role === 'admin';

  const [notifications, setNotifications] = useState({
    email: true,
    urgent: true,
    weeklyDigest: false,
  });
  const toggle = (key) => setNotifications((n) => ({ ...n, [key]: !n[key] }));

  // ---- Admin-only branding & app settings form state ----
  const [portalName, setPortalName] = useState(branding.portalName);
  const [logoPreview, setLogoPreview] = useState(branding.logoUrl);
  const [dashboardTicketsEnabled, setDashboardTicketsEnabled] = useState(branding.dashboardTicketsEnabled);
  const [forgotPasswordEnabled, setForgotPasswordEnabled] = useState(branding.forgotPasswordEnabled);
  const [timeoutMinutes, setTimeoutMinutes] = useState(branding.sessionTimeoutMinutes);
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSaveAdminSettings = async () => {
    setSavingSettings(true);
    setSaveMessage(null);
    try {
      await branding.save({
        branding_logo_url: logoPreview || '',
        branding_portal_name: portalName,
        dashboard_tickets_enabled: String(dashboardTicketsEnabled),
        forgot_password_enabled: String(forgotPasswordEnabled),
        session_timeout_minutes: String(timeoutMinutes),
      });
      setSaveMessage({ type: 'success', text: 'Settings saved. New session timeout applies on next login.' });
    } catch (err) {
      setSaveMessage({ type: 'error', text: err.message || 'Failed to save settings.' });
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <PageShell>
      <Topbar title="Settings" subtitle="Manage your profile and workspace preferences." showExport={false} />

      <div className="settings-grid">
        <div className="panel settings-card">
          <div className="panel-title">Profile</div>
          <div className="form-row">
            <label>Full name</label>
            <input type="text" defaultValue={agent?.name || ''} />
          </div>
          <div className="form-row">
            <label>Role</label>
            <input
              type="text"
              defaultValue={agent?.role === 'admin' ? 'Admin' : agent?.role === 'client' ? 'Client' : 'Dealer'}
              readOnly
            />
          </div>
          <div className="form-row">
            <label>Email address</label>
            <input type="email" defaultValue={agent?.email || ''} readOnly />
          </div>
        </div>

        <div className="panel settings-card">
          <div className="panel-title">Notifications</div>
          <ToggleRow label="Email me on new ticket replies" checked={notifications.email} onChange={() => toggle('email')} />
          <ToggleRow label="Alert me on urgent priority tickets" checked={notifications.urgent} onChange={() => toggle('urgent')} />
          <ToggleRow label="Send me a weekly performance digest" checked={notifications.weeklyDigest} onChange={() => toggle('weeklyDigest')} />
        </div>

        <div className="panel settings-card">
          <div className="panel-title">Session</div>
          <p className="account-copy">
            Your session automatically ends {sessionTimeoutMinutes} minutes after you log in.
            The countdown does not reset when you move your mouse, click, or refresh
            the page — only signing in again starts a new timer.
          </p>
          <div className="session-info-row">
            <span>Current session timeout</span>
            <b>{sessionTimeoutMinutes} minutes</b>
          </div>
        </div>

        <div className="panel settings-card account-panel">
          <div className="panel-title">Account</div>
          <p className="account-copy">
            Signing out will end your current session on this device. You'll need to
            sign back in to access your workspace.
          </p>
          <LogoutButton variant="text" />
        </div>

        {isAdmin && (
          <div className="panel settings-card admin-settings-panel span-2">
            <div className="panel-title">Admin Portal Branding</div>
            <p className="account-copy">
              Only admins can see this section. Changes here apply everywhere —
              the login page, sidebar, and staging splash screen.
            </p>

            <div className="branding-row">
              <div className="branding-logo-preview">
                {logoPreview ? <img src={logoPreview} alt="Logo preview" /> : <span>R</span>}
              </div>
              <div>
                <label className="upload-btn">
                  Upload logo
                  <input type="file" accept="image/*" onChange={handleLogoUpload} hidden />
                </label>
                {logoPreview && (
                  <button type="button" className="clear-logo-btn" onClick={() => setLogoPreview('')}>
                    Remove — use default (R) mark
                  </button>
                )}
              </div>
            </div>

            <div className="settings-form-row">
              <div className="form-row">
                <label>Admin Portal name</label>
                <input type="text" value={portalName} onChange={(e) => setPortalName(e.target.value)} />
              </div>
              <div className="form-row">
                <label>Session timeout (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={timeoutMinutes}
                  onChange={(e) => setTimeoutMinutes(Number(e.target.value))}
                />
              </div>
            </div>

            <ToggleRow
              label="Show ticket widgets on the dashboard"
              checked={dashboardTicketsEnabled}
              onChange={() => setDashboardTicketsEnabled((v) => !v)}
            />
            <ToggleRow
              label="Enable Forgot Password page for all users"
              checked={forgotPasswordEnabled}
              onChange={() => setForgotPasswordEnabled((v) => !v)}
            />

            {saveMessage && <div className={`save-message ${saveMessage.type}`}>{saveMessage.text}</div>}

            <button
              className="btn btn-navy"
              type="button"
              style={{ marginTop: 14 }}
              disabled={savingSettings}
              onClick={handleSaveAdminSettings}
            >
              {savingSettings ? 'Saving…' : 'Save Admin Settings'}
            </button>
          </div>
        )}

        {isAdmin && (
          <div className="panel settings-card span-2">
            <div className="panel-title">Admin Management</div>
            <div className="admin-links-grid">
              {ADMIN_LINKS.map((l) => (
                <Link to={l.to} key={l.to} className="admin-link-card">
                  <div className="admin-link-label">{l.label}</div>
                  <div className="admin-link-desc">{l.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <label className="toggle-row">
      <span>{label}</span>
      <span className={`switch${checked ? ' on' : ''}`} onClick={onChange}>
        <span className="switch-knob" />
      </span>
    </label>
  );
}
