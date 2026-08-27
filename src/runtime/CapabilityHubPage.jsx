import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, MapPin, Route, ShieldCheck, Trophy, QrCode, Radio, Building2, BarChart3, Truck, Globe2, Bell, Settings, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../AppContext.jsx';
import WorkspaceShell from './WorkspaceShell.jsx';
import './CapabilityHubPage.css';

const groups = [
  { title: 'Bathroom interaction', icon: MapPin, items: [
    ['Map', '/map', 'Discover canonical locations, map intelligence and live availability.', MapPin],
    ['Routing + offline', '/route', 'Plan multi-stop restroom routes and preserve activity when connectivity drops.', Route],
    ['Check-in', '/activity', 'Turn real visits into verified trust signals.', ShieldCheck],
    ['Review + evidence', '/evidence', 'Contribute ratings, observations, photos and provenance.', ShieldCheck],
    ['Engagement', '/engage', 'Connect verified activity to progression and rewards.', Trophy]
  ]},
  { title: 'Engagement primitives', icon: Trophy, items: [
    ['QR', '/engage', 'Use QR as an attribution and action trigger.', QrCode],
    ['Geofence', '/engagement/orchestrate', 'Use proximity events as contextual triggers.', Radio],
    ['Quest', '/play/quest', 'Run predefined Trust Quests using normal Kleenest activity.', Trophy],
    ['Leaderboards', '/leaderboards', 'Turn measurable participation into recognition and rewards.', Trophy]
  ]},
  { title: 'Commercial operations', icon: Building2, items: [
    ['Business', '/business', 'Manage locations, campaigns, promotions and engagement.', Building2, 'business_workspace'],
    ['Business intelligence', '/business/intelligence', 'Turn trust, occupancy and engagement signals into decisions.', BarChart3, 'business_intelligence'],
    ['Fleet', '/fleet', 'Coordinate routes, vehicles, drivers and operational performance.', Truck, 'fleet_workspace'],
    ['Enterprise', '/enterprise', 'Coordinate partner networks, campaigns and shared outcomes.', Globe2, 'enterprise_workspace']
  ]},
  { title: 'Platform intelligence', icon: Settings, items: [
    ['Cross-tier intelligence', '/intelligence', 'Shared network signals and leaderboards.', Globe2],
    ['Notifications', '/notifications', 'Delivery, priority and preference controls.', Bell],
    ['Admin', '/admin', 'Platform command, integrity and governance.', Settings],
    ['Owner', '/owner', 'Owner controls, tier previews and audit surfaces.', Settings]
  ]}
];

export default function CapabilityHubPage() {
  const { capabilityRegistry, workspaceCapabilities, membershipTier, configured, services } = useAppContext();
  const [query, setQuery] = useState('');
  const [catalog, setCatalog] = useState([]);

  useEffect(() => {
    let active = true;
    if (!configured || !services?.capabilityCoverage) return undefined;
    services.capabilityCoverage.list().then(rows => {
      if (active) setCatalog(Array.isArray(rows) ? rows : []);
    }).catch(() => {
      if (active) setCatalog([]);
    });
    return () => { active = false; };
  }, [configured, services]);

  const catalogByCode = useMemo(() => new Map(catalog.map(item => [item.feature_code, item])), [catalog]);
  const capabilities = useMemo(() => Object.entries(capabilityRegistry || {})
    .map(([key, item]) => ({
      key,
      ...item,
      name: item?.name || key,
      domain: item?.domain || key,
      description: item?.description || `Canonical ${key} capability`,
      status: item?.status
    }))
    .filter(item => {
      const q = query.trim().toLowerCase();
      return !q || `${item.name} ${item.domain} ${item.description || ''}`.toLowerCase().includes(q);
    }), [capabilityRegistry, query]);

  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return <WorkspaceShell workspace="consumer"><main className="page capability-hub">
    <div className="page-header"><div><span className="eyebrow">KLEENEST PLATFORM</span><h1>Everything Kleenest can do.</h1><p>One human-facing map of the product's connected capabilities. Choose an outcome instead of navigating database concepts.</p></div><div className="hero-actions"><span className="membership-badge">{membershipTier === 'premium' ? 'Premium · ad-free' : 'Free · full access + ads'}</span><Link className="button secondary" to="/integration">Integration health <ArrowRight size={15}/></Link></div></div>
    <section className="detail-panel capability-runtime"><div><span className="eyebrow">RUNTIME STATUS</span><h2>{configured ? 'Connected to Kleenest services' : 'Connection needs attention'}</h2><p>{configured ? 'Authoritative services are available through the application runtime.' : 'Supabase is not currently configured for this runtime.'}</p></div><div className="runtime-stats"><div><strong>{total}</strong><span>primary pathways</span></div><div><strong>{capabilities.length}</strong><span>registered capabilities</span></div><div><strong>{workspaceCapabilities?.length || 0}</strong><span>current workspace</span></div></div></section>
    <section className="detail-panel capability-search"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search capabilities, outcomes, or domains…" aria-label="Search capabilities"/></section>
    {groups.map(group => { const GroupIcon = group.icon; const items = group.items.filter(x => { const q = query.trim().toLowerCase(); if (q && !`${x[0]} ${x[2]}`.toLowerCase().includes(q)) return false; const code = x[4]; return !code || catalog.length === 0 || catalogByCode.get(code)?.enabled !== false; }); if (!items.length) return null; return <section className="capability-section" key={group.title}><div className="section-heading"><div><span className="eyebrow"><GroupIcon size={14}/> CAPABILITY CLUSTER</span><h2>{group.title}</h2></div><span className="tag">{items.length} pathways</span></div><div className="capability-grid">{items.map(([label, href, description, Icon]) => <Link className="capability-card" to={href} key={label}><span className="capability-card-icon"><Icon size={20}/></span><span><strong>{label}</strong><em>{description}</em></span><ArrowRight size={17}/></Link>)}</div></section>; })}
    <section className="capability-section"><div className="section-heading"><div><span className="eyebrow">RUNTIME CATALOG</span><h2>Registered capabilities</h2></div></div><div className="capability-grid">{capabilities.length ? capabilities.map(item => <div className="capability-card passive" key={item.key}><span className="capability-card-icon"><ShieldCheck size={19}/></span><span><strong>{item.name}</strong><em>{item.domain}{item.status ? ` · ${item.status}` : ''}</em></span></div>) : <div className="capability-card passive"><span className="capability-card-icon"><ShieldCheck size={19}/></span><span><strong>No capabilities registered</strong><em>The canonical runtime registry returned no entries.</em></span></div>}</div></section>
    <footer className="home-footer"><span>Free users receive the complete consumer product. Premium removes advertising; it does not remove features.</span><Link className="text-link" to="/pricing">Membership details <ArrowRight size={14}/></Link></footer>
  </main></WorkspaceShell>;
}
