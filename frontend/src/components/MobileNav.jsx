import { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import gsap from 'gsap';
import { visibleWorkspaceLinks } from '../data/navLinks';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/client';
import LogoutButton from './LogoutButton';
import './MobileNav.css';

const shortLabel = {
  'Knowledge Base': 'Knowledge',
};

export default function MobileNav() {
  const { agent, token } = useAuth();
  const [ticketCount, setTicketCount] = useState(null);
  // Bottom bar has room for ~5 icons — trim to the role's visible set.
  const links = visibleWorkspaceLinks(agent?.role).slice(0, 5);

  useEffect(() => {
    if (agent?.role === 'admin' || agent?.role === 'dealer') {
      api.getStats(token).then((s) => setTicketCount(s.totalTickets)).catch(() => setTicketCount(null));
    }
  }, [agent, token]);

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
              {link.to === '/tickets' && ticketCount !== null && <span className="mbn-badge">{ticketCount}</span>}
            </span>
            <span className="mbn-label">{shortLabel[link.label] || link.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
