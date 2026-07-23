import PageShell from '../components/PageShell';
import Topbar from '../components/Topbar';
import TotalTicketsCard from '../components/stats/TotalTicketsCard';
import OpenTicketsCard from '../components/stats/OpenTicketsCard';
import SolvedTodayCard from '../components/stats/SolvedTodayCard';
import AvgResolutionCard from '../components/stats/AvgResolutionCard';
import CSATScoreCard from '../components/stats/CSATScoreCard';
import RecentTickets from '../components/RecentTickets';
import VolumeByPriority from '../components/VolumeByPriority';
import AgentWorkload from '../components/AgentWorkload';
import AIChatPopup from '../components/AIChatPopup';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import './Overview.css';

function timeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const roleLabel = { admin: 'Admin', dealer: 'Dealer', client: 'Client' };

export default function Overview() {
  const { agent } = useAuth();
  const { dashboardTicketsEnabled } = useBranding();
  const firstName = agent?.name?.split(' ')[0] || 'there';

  return (
    <PageShell>
      <Topbar
        title={`${timeGreeting()}, ${roleLabel[agent?.role] || ''} ${firstName}`}
        subtitle={
          <>
            Queue health looks steady — <b>312 tickets</b> open, avg first response holding under 5 min.
          </>
        }
        showExport={false}
      />

      {dashboardTicketsEnabled ? (
        <>
          <div className="stats-grid">
            <TotalTicketsCard />
            <OpenTicketsCard />
            <SolvedTodayCard />
            <AvgResolutionCard />
            <CSATScoreCard />
          </div>

          <div className="overview-grid">
            <RecentTickets />
            <div className="side-stack">
              <VolumeByPriority />
              <AgentWorkload />
            </div>
          </div>
        </>
      ) : (
        <div className="tickets-disabled-note">
          Ticket widgets are currently hidden on the dashboard. An admin can
          re-enable them from Settings.
        </div>
      )}

      <AIChatPopup />
    </PageShell>
  );
}
