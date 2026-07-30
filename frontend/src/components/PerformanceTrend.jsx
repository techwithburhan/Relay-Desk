import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './PerformanceTrend.css';

const created = [10, 95, 120, 50, 95, 35, 55].map((y, i) => `${10 + i * 85},${y}`).join(' ');
const resolved = [130, 115, 100, 105, 75, 90, 60].map((y, i) => `${10 + i * 85},${y}`).join(' ');

export default function PerformanceTrend() {
  const createdRef = useRef(null);
  const resolvedRef = useRef(null);

  useEffect(() => {
    [createdRef.current, resolvedRef.current].forEach((line, i) => {
      if (!line) return;
      const length = line.getTotalLength();
      gsap.set(line, { strokeDasharray: length, strokeDashoffset: length });
      gsap.to(line, {
        strokeDashoffset: 0,
        duration: 1,
        delay: i * 0.25,
        ease: 'power2.inOut',
      });
    });
  }, []);

  return (
    <div className="panel trend-panel">
      <div className="panel-head">
        <div>
          <div className="panel-title">Performance Trends</div>
          <div className="panel-sub">Created vs. resolved — last 7 days</div>
        </div>
      </div>
      <svg viewBox="0 0 560 160" width="100%" height="160">
        <line x1="0" y1="30" x2="560" y2="30" stroke="#EEF0F6" strokeWidth="1" />
        <line x1="0" y1="70" x2="560" y2="70" stroke="#EEF0F6" strokeWidth="1" />
        <line x1="0" y1="110" x2="560" y2="110" stroke="#EEF0F6" strokeWidth="1" />
        <line x1="0" y1="150" x2="560" y2="150" stroke="#EEF0F6" strokeWidth="1" />
        <polyline ref={createdRef} fill="none" stroke="#3E7BE0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={created} />
        <polyline ref={resolvedRef} fill="none" stroke="#0E9C8E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={resolved} />
      </svg>
      <div className="trend-legend">
        <div><span className="swatch" style={{ background: '#3E7BE0' }} />Created</div>
        <div><span className="swatch" style={{ background: '#0E9C8E' }} />Resolved</div>
      </div>
    </div>
  );
}
