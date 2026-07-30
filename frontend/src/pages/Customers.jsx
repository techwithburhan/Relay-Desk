import PageShell from '../components/PageShell';
import Topbar from '../components/Topbar';
import '../components/RecentTickets.css';
import './Customers.css';

const customers = [
  { name: 'Alex R.', email: 'alex.r@brightwave.io', company: 'Brightwave', tickets: 6, lastContact: '10 min ago' },
  { name: 'Sarah T.', email: 'sarah.t@meridian.co', company: 'Meridian Co', tickets: 3, lastContact: '1 hr ago' },
  { name: 'Maria G.', email: 'maria.g@nordline.com', company: 'Nordline', tickets: 9, lastContact: '3 hrs ago' },
  { name: 'Devon K.', email: 'devon.k@fluxbase.dev', company: 'Fluxbase', tickets: 2, lastContact: '14 min ago' },
  { name: 'Priya N.', email: 'priya.n@orbitalhq.com', company: 'Orbital HQ', tickets: 5, lastContact: '22 min ago' },
];

export default function Customers() {
  return (
    <PageShell>
      <Topbar title="Customers" subtitle="Everyone who has reached out to your support team." />

      <div className="panel">
        <div className="panel-head">
          <div>
            <div className="panel-title">Customer Directory</div>
            <div className="panel-sub">{customers.length} customers</div>
          </div>
        </div>
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Company</th><th>Tickets</th><th>Last Contact</th></tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.email}>
                <td>
                  <div className="who">
                    <div className="who-dot" />
                    {c.name}
                  </div>
                </td>
                <td className="mono customer-email">{c.email}</td>
                <td>{c.company}</td>
                <td>{c.tickets}</td>
                <td>{c.lastContact}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
