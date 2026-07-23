import PageShell from '../components/PageShell';
import Topbar from '../components/Topbar';
import './KnowledgeBase.css';

const articles = [
  { title: 'Resetting a customer password', category: 'Account', views: '1.2k' },
  { title: 'Understanding billing cycles', category: 'Billing', views: '860' },
  { title: 'Troubleshooting failed data exports', category: 'Product', views: '640' },
  { title: 'How to escalate an urgent ticket', category: 'Process', views: '410' },
  { title: 'Setting up SSO for your workspace', category: 'Security', views: '295' },
  { title: 'API rate limits explained', category: 'Developers', views: '188' },
];

export default function KnowledgeBase() {
  return (
    <PageShell>
      <Topbar title="Knowledge Base" subtitle="Help articles your team and customers can reference." />

      <div className="kb-grid">
        {articles.map((a) => (
          <div className="kb-card" key={a.title}>
            <span className="kb-category">{a.category}</span>
            <h3 className="kb-title">{a.title}</h3>
            <div className="kb-meta">{a.views} views</div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
