import { useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import gsap from 'gsap';
import { visibleWorkspaceLinks } from '../data/navLinks';
import { useAuth } from '../context/AuthContext';
import LogoutButton from './LogoutButton';
import './MobileNav.css';

const shortLabel = {
  'Knowledge Base': 'Knowledge',
};

export default function MobileNav() {
  const { agent } = useAuth();
  // Bottom bar has room for ~5 icons — trim to the role's visible set.
  const links = visibleWorkspaceLinks(agent?.role).slice(0, 5);

  useEffect(() => {
    gsap.fromTo(
      '.mbn-item',
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: 'power2.out' }
    );
  }, []);

  return (
    <>
      {/* Top bar: user name on the left, logout on the right */}
      <div className="mobile-topbar">
        <Link to="/settings" className="mtop-user">
          <span className="mtop-avatar" />
          <span className="mtop-name">{agent?.name || 'Guest'}</span>
        </Link>
        <LogoutButton variant="icon" />
      </div>

      {/* Bottom sticky tab bar */}
      <nav className="mobile-bottom-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => `mbn-item${isActive ? ' active' : ''}`}
          >
            <span className="mbn-icon-wrap">
              {link.icon}
              {link.badge && <span className="mbn-badge">{link.badge}</span>}
            </span>
            <span className="mbn-label">{shortLabel[link.label] || link.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
