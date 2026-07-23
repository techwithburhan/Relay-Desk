import './ActivityFeed.css';

const activity = [
  { text: <><b>Maria G.</b> commented on <b>#T-98049</b></>, time: '10 min ago' },
  { text: <><b>Lisa M.</b> marked <b>#T-98049</b> as solved</>, time: '14 min ago' },
  { text: <><b>System</b> created ticket <b>#T-98051</b></>, time: '18 min ago' },
  { text: <><b>John D.</b> commented on <b>#T-98051</b></>, time: '3 hrs ago' },
];

export default function ActivityFeed() {
  return (
    <div className="panel activity-panel">
      <div className="panel-head">
        <div>
          <div className="panel-title">Recent Activity</div>
          <div className="panel-sub">Live feed</div>
        </div>
      </div>
      {activity.map((a, i) => (
        <div className="activity-row" key={i}>
          <div className="activity-dot">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0E9C8E" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="activity-row-inner">
            <div className="activity-text">{a.text}</div>
            <div className="activity-time">{a.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
