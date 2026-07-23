import StatCard from '../StatCard';

export default function CSATScoreCard() {
  return (
    <StatCard
      label="CSAT Score"
      value="4.8"
      unit="/5"
      delta="▲ 0.2 this month"
      deltaType="up"
      iconBg="#FCF0DD"
      iconColor="#9A6812"
      icon={
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2Z" />
        </svg>
      }
    />
  );
}
