import StatCard from '../StatCard';

export default function SolvedTodayCard({ value = '—' }) {
  return (
    <StatCard
      label="Solved Today"
      value={value}
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
