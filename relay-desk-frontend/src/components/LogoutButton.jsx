import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/client';
import './LogoutButton.css';

export default function LogoutButton({ variant = 'text' }) {
  const [open, setOpen] = useState(false);
  const backdropRef = useRef(null);
  const cardRef = useRef(null);
  const navigate = useNavigate();
  const { signOut, token } = useAuth();

  const openModal = () => {
    // Point 2 fix: close any other open dialogs/overlays (AI chat, mobile
    // nav drawer, etc.) before showing the logout confirmation, so nothing
    // can render on top of it.
    window.dispatchEvent(new CustomEvent('relaydesk:close-overlays'));
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, scale: 0.92, y: 10 },
      { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'back.out(1.7)' }
    );
  }, [open]);

  const handleConfirm = async () => {
    try {
      await api.logout(token);
    } catch {
      // even if the backend call fails, still clear the local session
    }
    setOpen(false);
    signOut('user logged out');
    navigate('/');
  };

  const modal = open
    ? createPortal(
        <div className="logout-backdrop" ref={backdropRef} onClick={() => setOpen(false)}>
          <div className="logout-card" ref={cardRef} onClick={(e) => e.stopPropagation()}>
            <div className="logout-icon-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
            </div>
            <h3 className="logout-title">Log out of Relay Desk?</h3>
            <p className="logout-message">Do you want to log out of this window?</p>
            <div className="logout-actions">
              <button className="logout-cancel" onClick={() => setOpen(false)} type="button">Cancel</button>
              <button className="logout-confirm" onClick={handleConfirm} type="button">Log out</button>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      {variant === 'icon' ? (
        <button className="logout-icon-btn" onClick={openModal} type="button" aria-label="Log out">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
        </button>
      ) : (
        <button className="logout-text-btn" onClick={openModal} type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
          Log out
        </button>
      )}

      {modal}
    </>
  );
}
