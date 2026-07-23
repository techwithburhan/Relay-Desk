import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './TicketTimeline.css';

function buildEvents(ticket) {
  const events = [{ label: 'Ticket created', time: ticket.createdAt, who: ticket.requester }];
  (ticket.comments || []).forEach((c) => {
    events.push({ label: `${c.author} replied`, time: c.time, who: c.author });
  });
  events.push({ label: `Status: ${ticket.status}`, time: ticket.updatedAt, who: ticket.assigned });
  return events;
}

function buildActivityBars(ticket) {
  const counts = {};
  (ticket.comments || []).forEach((c) => {
    counts[c.author] = (counts[c.author] || 0) + 1;
  });
  const entries = Object.entries(counts);
  const max = Math.max(1, ...entries.map(([, n]) => n));
  return entries.map(([author, count]) => ({ author, count, pct: (count / max) * 100 }));
}

export default function TicketTimeline({ ticket }) {
  const lineRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(
      lineRef.current,
      { scaleY: 0 },
      { scaleY: 1, duration: 0.6, transformOrigin: 'top', ease: 'power2.out' }
    )
      .fromTo(
        '.tt-dot',
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, stagger: 0.15, ease: 'back.out(2)' },
        '-=0.45'
      )
      .fromTo(
        '.tt-event-text',
        { opacity: 0, x: -8 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.15 },
        '-=0.6'
      )
      .fromTo(
        '.tt-bar-fill',
        { scaleY: 0 },
        { scaleY: 1, duration: 0.5, stagger: 0.1, ease: 'power3.out', transformOrigin: 'bottom' },
        '-=0.2'
      );

    return () => tl.kill();
  }, [ticket]);

  const events = buildEvents(ticket);
  const bars = buildActivityBars(ticket);
  const ageLabel = ticket.createdAt;

  return (
    <div className="panel timeline-panel">
      <div className="panel-head">
        <div>
          <div className="panel-title">Ticket Timeline</div>
          <div className="panel-sub">Created {ageLabel}</div>
        </div>
      </div>

      <div className="tt-timeline">
        <div className="tt-line" ref={lineRef} />
        {events.map((e, i) => (
          <div className="tt-event" key={i}>
            <span className="tt-dot" />
            <div className="tt-event-text">
              <div className="tt-event-label">{e.label}</div>
              <div className="tt-event-time">{e.time}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="tt-graph-section">
        <div className="tt-graph-title">Messages by participant</div>
        {bars.length === 0 ? (
          <div className="tt-no-activity">No replies yet.</div>
        ) : (
          <div className="tt-bar-chart">
            {bars.map((b) => (
              <div className="tt-bar-col" key={b.author}>
                <div className="tt-bar-track">
                  <div className="tt-bar-fill" style={{ height: `${b.pct}%` }} />
                </div>
                <span className="tt-bar-count">{b.count}</span>
                <span className="tt-bar-label">{b.author}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
