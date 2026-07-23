import { Link } from 'react-router-dom';
import SessionTimer from './SessionTimer';
import './Topbar.css';

export default function Topbar({ title, subtitle, showExport = true }) {
  return (
    <div className="topbar">
      <div>
        <h1 className="display topbar-title">{title}</h1>
        {subtitle && <div className="topbar-sub">{subtitle}</div>}
      </div>
      <div className="topbar-actions">
        <SessionTimer />
        <div className="search-box">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          Search tickets...
        </div>
        <div className="icon-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>
          <span className="dot-alert" />
        </div>
        {showExport && <button className="btn btn-outline" type="button">Export</button>}
        <Link to="/tickets/new" className="btn btn-teal">+ New Ticket</Link>
      </div>
    </div>
  );
}
