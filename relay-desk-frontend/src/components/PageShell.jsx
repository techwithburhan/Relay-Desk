import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import './PageShell.css';

export default function PageShell({ children }) {
  const mainRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (!mainRef.current) return;
    gsap.fromTo(
      mainRef.current,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }
    );
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <Sidebar />
      <MobileNav />
      <main className="main-area" ref={mainRef}>{children}</main>
    </div>
  );
}
