import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './AgentWorkload.css';

const agents = [
  { name: 'Daniel L.', tickets: 29 },
  { name: 'Sarah J.', tickets: 22 },
  { name: 'Lisa M.', tickets: 35 },
  { name: 'Mike P.', tickets: 17 },
];

const max = Math.max(...agents.map((a) => a.tickets));

export default function AgentWorkload() {
  const rootRef = useRef(null);

  useEffect(() => {
    const bars = rootRef.current.querySelectorAll('.agent-bar');
    gsap.fromTo(
      bars,
      { scaleY: 0 },
      { scaleY: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out', transformOrigin: 'bottom' }
    );
  }, []);

  return (
    <div className="panel workload-panel" ref={rootRef}>
      <div className="panel-head">
        <div>
          <div className="panel-title">Agent Workload</div>
          <div className="panel-sub">Open tickets per agent</div>
        </div>
      </div>
      <div className="agent-bar-row">
        {agents.map((a) => (
          <div className="agent-col" key={a.name}>
            <div className="agent-bar" style={{ height: `${(a.tickets / max) * 100}%` }} />
            <span className="agent-name">{a.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
