import { useEffect, useRef } from 'react';
import './ConfettiBurst.css';

const COLORS = ['#0E9C8E', '#E8A23D', '#E8604C', '#3E7BE0', '#7C5CBF', '#F5A97F'];

export default function ConfettiBurst() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const pieces = [];
    for (let i = 0; i < 80; i++) {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      el.style.left = `${Math.random() * 100}%`;
      el.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
      el.style.animationDelay = `${Math.random() * 0.4}s`;
      el.style.animationDuration = `${1.6 + Math.random() * 1.2}s`;
      el.style.transform = `rotate(${Math.random() * 360}deg)`;
      el.style.width = el.style.height = `${6 + Math.random() * 6}px`;
      root.appendChild(el);
      pieces.push(el);
    }
    return () => pieces.forEach((p) => p.remove());
  }, []);

  return <div className="confetti-root" ref={rootRef} />;
}
