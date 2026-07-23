import StatCard from '../StatCard';

export default function SolvedTodayCard() {
  return (
    <StatCard
      label="Solved Today"
      value="96"
      delta="▲ 12 vs yesterday"
      deltaType="up"
      iconBg="#E4F7F3"
      iconColor="#0E9C8E"
      icon={
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 13l4 4L19 7" />
        </svg>
      }
    />
  );
}
