import StatCard from '../StatCard';

export default function AvgResolutionCard() {
  return (
    <StatCard
      label="Avg Resolution"
      value="4.1"
      unit="hrs"
      delta="▼ down from 4.6 hrs"
      deltaType="down"
      iconBg="#E7EEFB"
      iconColor="#2E5AAC"
      icon={
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3.5 2" />
        </svg>
      }
    />
  );
}
