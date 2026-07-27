import { useEffect, useState } from 'react';
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
import * as api from '../api/client';
import './Overview.css';

function timeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const roleLabel = { admin: 'Admin', dealer: 'Dealer', client: 'Client' };

export default function Overview() {
  const { agent, token } = useAuth();
  const { dashboardTicketsEnabled } = useBranding();
  const firstName = agent?.name?.split(' ')[0] || 'there';
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.getStats(token).then(setStats).catch(() => setStats(null));
  }, [token]);

  return (
    <PageShell>
      <Topbar
        title={`${timeGreeting()}, ${roleLabel[agent?.role] || ''} ${firstName}`}
        subtitle={
          stats ? (
            <>
              Queue health looks steady — <b>{stats.openTickets} tickets</b> open, avg first response holding under 5 min.
            </>
          ) : (
            'Loading your queue health…'
          )
        }
        showExport={false}
      />

      {dashboardTicketsEnabled ? (
        <>
          <div className="stats-grid">
            <TotalTicketsCard value={stats?.totalTickets} />
            <OpenTicketsCard value={stats?.openTickets} />
            <SolvedTodayCard value={stats?.solvedToday} />
            <AvgResolutionCard value={stats?.avgResolutionHours} />
            <CSATScoreCard value={stats?.csatScore} />
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
