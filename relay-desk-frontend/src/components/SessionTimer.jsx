import { useAuth } from '../context/AuthContext';
import './SessionTimer.css';

export default function SessionTimer() {
  const { secondsRemaining } = useAuth();

  if (secondsRemaining === null) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const label = `${minutes}:${String(seconds).padStart(2, '0')}`;
  const low = secondsRemaining <= 30;

  return (
    <div className={`session-timer${low ? ' low' : ''}`} title="Session time remaining">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
      {label}
    </div>
  );
}
