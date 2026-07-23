import PageShell from '../components/PageShell';
import Topbar from '../components/Topbar';
import PerformanceTrend from '../components/PerformanceTrend';
import ActivityFeed from '../components/ActivityFeed';
import VolumeByPriority from '../components/VolumeByPriority';
import AgentWorkload from '../components/AgentWorkload';
import './Reports.css';

export default function Reports() {
  return (
    <PageShell>
      <Topbar title="Reports" subtitle="Trends and activity across your support operation." />

      <div className="reports-grid">
        <PerformanceTrend />
        <ActivityFeed />
      </div>

      <div className="reports-grid">
        <VolumeByPriority />
        <AgentWorkload />
      </div>
    </PageShell>
  );
}
