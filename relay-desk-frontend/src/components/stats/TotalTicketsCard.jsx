import StatCard from '../StatCard';

export default function TotalTicketsCard() {
  return (
    <StatCard
      label="Total Tickets"
      value="1,480"
      delta="▲ 5.2% this week"
      deltaType="up"
      iconBg="#EDEFF6"
      iconColor="#5B6478"
      icon={
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M3 9h18" />
        </svg>
      }
    />
  );
}
