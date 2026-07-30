import { useEffect, useState } from 'react';
import PageShell from '../components/PageShell';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/client';
import './Downloads.css';

export default function Downloads() {
  const { token } = useAuth();
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getDownloads(token)
      .then(setDownloads)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const grouped = downloads.reduce((acc, d) => {
    acc[d.category] = acc[d.category] || [];
    acc[d.category].push(d);
    return acc;
  }, {});

  return (
    <PageShell>
      <Topbar title="Essential Downloads" subtitle="Margin reports and tools available to your account." />

      {loading && <div className="downloads-status">Loading downloads…</div>}
      {error && <div className="downloads-status error">{error}</div>}

      {!loading && !error && Object.keys(grouped).length === 0 && (
        <div className="downloads-status">No downloads are available for your account yet.</div>
      )}

      {Object.entries(grouped).map(([category, items]) => (
        <div className="panel downloads-panel" key={category}>
          <div className="panel-title">{category}</div>
          <div className="downloads-grid">
            {items.map((d) => (
              <a
                key={d.id}
                href={d.file_url}
                className="download-card"
                target="_blank"
                rel="noreferrer"
                download
              >
                <div className={`download-icon ${d.file_type}`}>
                  {d.file_type === 'exe' ? 'EXE' : 'PDF'}
                </div>
                <div>
                  <div className="download-title">{d.title}</div>
                  <div className="download-sub">
                    {d.file_type === 'exe' ? 'Windows software' : 'PDF document'}
                  </div>
                </div>
                <svg className="download-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
                  <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      ))}
    </PageShell>
  );
}
