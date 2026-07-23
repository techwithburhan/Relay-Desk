import './StatCard.css';

export default function StatCard({
  label,
  value,
  unit,
  icon,
  iconBg,
  iconColor,
  delta,
  deltaType = 'up', // 'up' | 'down' | 'live'
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        <div className="stat-icon" style={{ background: iconBg, color: iconColor }}>
          {icon}
        </div>
      </div>
      <div className="stat-value display">
        {value}
        {unit && <span className="stat-unit">{unit}</span>}
      </div>
      {deltaType === 'live' ? (
        <span className="live-pulse">
          <span className="pulse-dot" />
          {delta}
        </span>
      ) : (
        <span className={`stat-delta ${deltaType === 'up' ? 'up' : 'down'}`}>{delta}</span>
      )}
    </div>
  );
}
