import StatCard from '../StatCard';

export default function OpenTicketsCard() {
  return (
    <StatCard
      label="Open Tickets"
      value="312"
      delta="Live queue"
      deltaType="live"
      iconBg="#FCF0DD"
      iconColor="#9A6812"
      icon={
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 3" />
        </svg>
      }
    />
  );
}
