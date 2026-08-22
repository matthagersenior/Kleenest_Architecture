import { useMemo, useState } from 'react';
import { useAppContext } from '../AppContext.jsx';
import WorkspaceShell from './WorkspaceShell.jsx';

const groups = [
  { title: 'Bathroom interaction', items: [['Map','/map','Discover canonical locations and place intelligence.'],['Check-in','/activity','Record visit activity through the canonical service layer.'],['Review + evidence','/evidence','Contribute ratings, observations and evidence.'],['Engagement','/engage','Connect verified activity to progression and rewards.']] },
  { title: 'Engagement primitives', items: [['QR','/engage','Use QR as an attribution and action trigger.'],['Geofence','/engagement/orchestrate','Use proximity events as contextual triggers.'],['Quest','/play/quest','Run predefined routes and tasks.'],['Leaderboards','/leaderboards','Turn measurable participation into recognition and rewards.']] },
  { title: 'Commercial operations', items: [['Business','/business','Locations, campaigns, promotions and engagement.'],['Business intelligence','/business/intelligence','Growth, benchmarks, occupancy and engagement signals.'],['Fleet','/fleet','Routes, vehicles, drivers and operational performance.'],['Enterprise','/enterprise','Partner networks, campaigns and shared outcomes.']] },
  { title: 'Platform intelligence', items: [['Cross-tier intelligence','/intelligence','Shared network signals and leaderboards.'],['Notifications','/notifications','Delivery and preference controls.'],['Admin','/admin','Platform command, integrity and governance.'],['Owner','/owner','Owner controls, tier previews and audit surfaces.']] },
];

export default function CapabilityHubPage() {
  const { capabilityRegistry, workspaceCapabilities, membershipTier, configured } = useAppContext();
  const [query, setQuery] = useState('');
  const capabilities = useMemo(() => Object.values(capabilityRegistry || {}).filter((item) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return `${item.name} ${item.domain} ${item.description || ''}`.toLowerCase().includes(q);
  }), [capabilityRegistry, query]);
  return (
    <WorkspaceShell workspace="consumer">
      <section className="page-heading"><span className="eyebrow">Canonical wiring</span><h1>Capability Hub</h1><p>One UI entry point for the canonical services registered in the application runtime.</p></section>
      <section className="panel"><strong>Runtime</strong><p>{configured ? 'Supabase configured' : 'Supabase not configured'} · tier: {membershipTier || 'consumer'}</p><div className="action-grid"><a className="btn primary" href="/integration">Open Full Wiring Hub</a><a className="btn" href="/consumer/actions">Open Bathroom Action Center</a><a className="btn" href="/engagement/orchestrate">Open QR + Geofence + Quest</a></div><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter capabilities…" /></section>
      {groups.map((group) => <section className="section" key={group.title}><h2>{group.title}</h2><div className="card-grid">{group.items.map(([label, href, description]) => <a className="capability-card" href={href} key={label}><strong>{label}</strong><span>{description}</span></a>)}</div></section>)}
      <section className="section"><h2>Registered capabilities</h2><div className="card-grid">{capabilities.map((item) => <div className="capability-card" key={item.key || item.name}><strong>{item.name}</strong><span>{item.domain}{item.status ? ` · ${item.status}` : ''}</span></div>)}</div></section>
      <section className="section"><h2>Current workspace capabilities</h2><div className="tags">{(workspaceCapabilities || []).map((item) => <span className="tag" key={item.key || item.name}>{item.name || item.key}</span>)}</div></section>
    </WorkspaceShell>
  );
}
