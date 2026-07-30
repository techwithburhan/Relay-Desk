import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/client';
import './AgentWorkload.css';

export default function AgentWorkload() {
  const { token } = useAuth();
  const rootRef = useRef(null);
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    api.getAgentWorkload(token).then(setAgents).catch(() => setAgents([]));
  }, [token]);

  const max = Math.max(1, ...agents.map((a) => a.open_tickets));

  useEffect(() => {
    if (!rootRef.current || agents.length === 0) return;
    const bars = rootRef.current.querySelectorAll('.agent-bar');
    gsap.fromTo(bars, { scaleY: 0 }, { scaleY: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out', transformOrigin: 'bottom' });
  }, [agents]);

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
          <div className="agent-col" key={a.id}>
            <div className="agent-bar" style={{ height: `${(a.open_tickets / max) * 100}%` }} />
            <span className="agent-name">{a.name}</span>
          </div>
        ))}
        {agents.length === 0 && <div className="no-comments">No agent data yet.</div>}
      </div>
    </div>
  );
}
