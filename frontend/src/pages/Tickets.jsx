import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PageShell from '../components/PageShell';
import Topbar from '../components/Topbar';
import TicketsTable from '../components/TicketsTable';
import '../pages/NewTicket.css';

export default function Tickets() {
  const location = useLocation();
  const [toast, setToast] = useState(location.state?.toast || null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <PageShell>
      <Topbar title="Tickets" subtitle="Every conversation your team is tracking, in one queue." showExport={false} />
      {toast && <div className="new-ticket-toast">✓ {toast}</div>}
      <TicketsTable />
    </PageShell>
  );
}
