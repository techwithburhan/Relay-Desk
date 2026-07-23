import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { visibleWorkspaceLinks, adminLinks, systemLinks } from '../data/navLinks';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import LogoutButton from './LogoutButton';
import './Sidebar.css';

export default function Sidebar() {
  const { agent } = useAuth();
  const { logoUrl, portalName } = useBranding();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('relaydesk.sidebarCollapsed') === 'true');
  const isAdmin = agent?.role === 'admin';

  const workspaceLinks = visibleWorkspaceLinks(agent?.role);

  function toggleCollapsed() {
    setCollapsed((c) => {
      localStorage.setItem('relaydesk.sidebarCollapsed', String(!c));
      return !c;
    });
  }

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="brand">
        {logoUrl ? (
          <img src={logoUrl} alt={portalName} className="brand-mark-img" />
        ) : (
          <div className="brand-mark">R</div>
        )}
        {!collapsed && (
          <div>
            <div className="brand-name">{portalName}</div>
            <div className="brand-sub">Support Console</div>
          </div>
        )}
      </div>

      {!collapsed && <div className="nav-section-label">Workspace</div>}
      {workspaceLinks.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          title={collapsed ? link.label : undefined}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          {link.icon}
          {!collapsed && link.label}
          {!collapsed && link.badge && <span className="nav-badge">{link.badge}</span>}
        </NavLink>
      ))}

      {isAdmin && (
        <>
          {!collapsed && <div className="nav-section-label">Admin Management</div>}
          {adminLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              title={collapsed ? link.label : undefined}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              {link.icon}
              {!collapsed && link.label}
            </NavLink>
          ))}
        </>
      )}

      {!collapsed && <div className="nav-section-label">System</div>}
      {systemLinks.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          title={collapsed ? link.label : undefined}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          {link.icon}
          {!collapsed && link.label}
        </NavLink>
      ))}

      <button className="sidebar-collapse-btn" onClick={toggleCollapsed} type="button" title={collapsed ? 'Expand sidebar' : 'Hide sidebar'}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: collapsed ? 'rotate(180deg)' : 'none' }}>
          <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
        </svg>
        {!collapsed && <span>Hide sidebar</span>}
      </button>

      <div className="sidebar-footer">
        <div className="avatar-sm" />
        {!collapsed && (
          <div className="sidebar-footer-text">
            <div className="foot-name">{agent?.name || 'Guest'}</div>
            <div className="foot-role">
              {agent?.role === 'admin' ? 'Admin' : agent?.role === 'client' ? 'Client' : 'Dealer'}
            </div>
          </div>
        )}
        <LogoutButton variant="icon" />
      </div>
    </aside>
  );
}
