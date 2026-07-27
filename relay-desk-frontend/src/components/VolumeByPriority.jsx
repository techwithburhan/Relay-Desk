import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/client';
import './VolumeByPriority.css';

const COLORS = { Urgent: '#E8604C', Critical: '#B23A28', High: '#E8A23D', Medium: '#3E7BE0', Low: '#7C87A3' };
const CIRC = 2 * Math.PI * 45;

export default function VolumeByPriority() {
  const { token } = useAuth();
  const rootRef = useRef(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    api.getPriorityVolume(token).then(setData).catch(() => setData({ total: 0, breakdown: [] }));
  }, [token]);

  const segments = (data?.breakdown || []).map((b) => ({
    label: b.priority, pct: b.pct, color: COLORS[b.priority] || '#7C87A3',
  }));

  let offset = 0;
  const arcs = segments.map((s) => {
    const dash = (s.pct / 100) * CIRC;
    const arc = { ...s, dash, offset };
    offset += dash;
    return arc;
  });

  useEffect(() => {
    if (!data || !rootRef.current) return;
    const circles = rootRef.current.querySelectorAll('.donut-arc');
    gsap.set(circles, { strokeDasharray: CIRC, strokeDashoffset: CIRC });
    const tl = gsap.timeline();
    circles.forEach((circle, i) => {
      const arc = arcs[i];
      if (!arc) return;
      tl.to(circle, {
        strokeDasharray: `${arc.dash} ${CIRC - arc.dash}`,
        strokeDashoffset: -arc.offset,
        duration: 0.6, ease: 'power2.out',
      }, i === 0 ? 0 : '-=0.35');
    });
    gsap.fromTo('.donut-total-text', { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)', delay: 0.3 });
    gsap.fromTo('.legend-row', { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.35, stagger: 0.08, delay: 0.5 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const total = data?.total ?? '—';

  return (
    <div className="panel volume-panel" ref={rootRef}>
      <div className="panel-head">
        <div>
          <div className="panel-title">Volume by Priority</div>
          <div className="panel-sub">{total} open tickets</div>
        </div>
      </div>

      <svg viewBox="0 0 120 120" width="120" height="120" className="donut-svg">
        <circle cx="60" cy="60" r="45" fill="none" stroke="#EDEFF6" strokeWidth="18" />
        {arcs.map((a) => (
          <circle key={a.label} className="donut-arc" cx="60" cy="60" r="45" fill="none" stroke={a.color} strokeWidth="18" transform="rotate(-90 60 60)" />
        ))}
        <text className="donut-total-text" x="60" y="56" textAnchor="middle" fontFamily="Space Grotesk" fontSize="19" fontWeight="700" fill="#151A2C">{total}</text>
        <text className="donut-total-text" x="60" y="72" textAnchor="middle" fontFamily="Inter" fontSize="9" fill="#9399AC">tickets</text>
      </svg>

      <div className="legend">
        {segments.length === 0 && <div className="no-comments">No open tickets yet.</div>}
        {segments.map((s) => (
          <div className="legend-row" key={s.label}>
            <span className="legend-dot" style={{ background: s.color }} />
            {s.label}
            <span className="legend-val">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
