import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { Activity, BarChart3, Building2, ChevronRight, Compass, Database, Map, Menu, ShieldCheck, Sparkles, Trophy, Truck, Users, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { supabase } from './infrastructure/supabase/client.js';

const WORKSPACES = [
  { id: 'consumer', label: 'Kleenest', path: '/', icon: Compass },
  { id: 'business', label: 'Business', path: '/business', icon: Building2 },
  { id: 'fleet', label: 'Fleet', path: '/fleet', icon: Truck },
  { id: 'enterprise', label: 'Enterprise', path: '/enterprise', icon: BarChart3 },
  { id: 'admin', label: 'Admin', path: '/admin', icon: ShieldCheck },
];

const MEMBERSHIPS = [
  { id: 'free', label: 'Free', detail: 'Explore Kleenest' },
  { id: 'premium', label: 'Premium', detail: 'Ad-free for a one-time $5 purchase' },
  { id: 'family', label: 'Family', detail: 'Shared household experience' },
  { id: 'business', label: 'Business', detail: 'Growth and engagement' },
  { id: 'enterprise', label: 'Enterprise', detail: 'Advanced data and partnerships' },
  { id: 'fleet', label: 'Fleet', detail: 'Operations and network performance' },
  { id: 'admin', label: 'Admin', detail: 'Full test and control surface' },
];

function Shell({ children, workspace = 'consumer' }) {
  const [open, setOpen] = useState(false);
  const current = WORKSPACES.find(item => item.id === workspace) || WORKSPACES[0];
  const nav = workspace === 'consumer'
    ? [['Explore', '/map'], ['Routes', '/route'], ['Activity', '/activity'], ['Play', '/play'], ['Community', '/community']]
    : workspace === 'business'
      ? [['Overview', '/business'], ['Intelligence', '/business/intelligence'], ['Engage', '/business/engage'], ['Analytics', '/business/analytics']]
      : workspace === 'fleet'
        ? [['Operations', '/fleet'], ['Routes', '/fleet/routes'], ['Performance', '/fleet/performance'], ['Opportunities', '/fleet/opportunities'], ['Goals', '/fleet/goals']]
        : workspace === 'enterprise'
          ? [['Command', '/enterprise'], ['Partners', '/enterprise/partners'], ['Campaigns', '/enterprise/campaigns'], ['Performance', '/enterprise/performance'], ['Fleet', '/enterprise/fleet']]
          : [['Data', '/admin/data'], ['Control Room', '/admin/crud'], ['Tier Preview', '/admin/preview']];

  return <div className={`app workspace-${workspace}`}>
    <header className="topbar">
      <Link className="brand" to="/" onClick={() => setOpen(false)}><span className="brand-mark">K</span><span>Kleenest</span></Link>
      <button className="mobile-menu" type="button" onClick={() => setOpen(value => !value)} aria-label="Toggle navigation">{open ? <X size={20} /> : <Menu size={20} />}</button>
      <nav className={`nav ${open ? 'open' : ''}`}>{nav.map(([label, path]) => <Link key={path} to={path} onClick={() => setOpen(false)}>{label}</Link>)}</nav>
      <div className="top-actions"><span className="membership">Free</span><span className="workspace-label">{current.label}</span></div>
    </header>
    <main>{children}</main>
  </div>;
}

function Home() {
  return <Shell><section className="hero"><div><span className="eyebrow">Find better. Live better.</span><h1>Your cleanest route through the world.</h1><p>Kleenest connects places, people, routes, rewards, and real-world community intelligence in one simple experience.</p><div className="hero-actions"><Link className="button primary" to="/map">Explore the network <ChevronRight size={17} /></Link><Link className="button secondary" to="/play">Play & earn</Link></div></div><div className="hero-card"><Compass size={28}/><strong>Live network</strong><span>Discover current places, activity, quality signals, and routes.</span></div></section><section className="workspace-grid">{WORKSPACES.slice(1).map(({id,label,icon:Icon,path}) => <Link className="workspace-card" key={id} to={path}><Icon size={22}/><span><strong>{label}</strong><small>{MEMBERSHIPS.find(item => item.id === id)?.detail}</small></span><ChevronRight size={18}/></Link>)}</section></Shell>;
}

function WorkspaceLanding({ workspace }) {
  const meta = useMemo(() => MEMBERSHIPS.find(item => item.id === workspace) || MEMBERSHIPS[0], [workspace]);
  const sections = workspace === 'fleet' ? ['Operations', 'Routes', 'Performance', 'Opportunities', 'Goals'] : workspace === 'enterprise' ? ['Command', 'Partners', 'Campaigns', 'Performance', 'Fleet'] : workspace === 'business' ? ['Overview', 'Intelligence', 'Engage', 'Analytics'] : ['Data', 'Control Room', 'Tier Preview'];
  return <Shell workspace={workspace}><section className="page-head"><span className="eyebrow">{meta.label}</span><h1>{meta.detail}</h1><p>The architecture surface is capability-first: every destination is backed by a domain contract instead of a parallel service.</p></section><section className="feature-grid">{sections.map((label, index) => <Link className="feature-card" key={label} to={`${workspace === 'fleet' ? '/fleet' : `/${workspace}`}${index === 0 ? '' : `/${label.toLowerCase().replaceAll(' ', '-')}`}`}><span className="feature-icon">{index === 0 ? <Sparkles size={20}/> : index === 1 ? <Map size={20}/> : index === 2 ? <BarChart3 size={20}/> : <ChevronRight size={20}/>}</span><strong>{label}</strong><small>Canonical {label.toLowerCase()} capability surface.</small></Link>)}</section></Shell>;
}

function MapSurface() { return <Shell><section className="page-head"><span className="eyebrow">Explore</span><h1>Map & location intelligence</h1><p>Canonical locations remain the shared identity for discovery, routing, check-ins, reviews, and intelligence.</p><div className="empty-map"><Map size={34}/><strong>Map workspace ready for the canonical location service</strong><span>No second map implementation is introduced here.</span></div></section></Shell>; }
function SimpleSurface({ title, detail, icon: Icon = Activity }) { return <Shell><section className="page-head"><span className="eyebrow">Kleenest</span><h1>{title}</h1><p>{detail}</p><div className="surface-card"><Icon size={28}/><strong>Capability-first surface</strong><span>This screen is wired to the architecture contract; domain implementation is added without creating a parallel service.</span></div></section></Shell>; }

export default function CanonicalAppRuntime() {
  return <Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/map" element={<MapSurface/>}/>
    <Route path="/route" element={<SimpleSurface title="Routes" detail="Route planning and attribution use the canonical routing domain." icon={Map}/>}/>
    <Route path="/activity" element={<SimpleSurface title="Activity" detail="Your check-ins, reviews, favorites, progression, and rewards." icon={Activity}/>}/>
    <Route path="/play" element={<SimpleSurface title="Play" detail="Progression, games, contests, and rewards." icon={Trophy}/>}/>
    <Route path="/community" element={<SimpleSurface title="Community" detail="Social participation and family/community capabilities." icon={Users}/>}/>
    <Route path="/business/*" element={<WorkspaceLanding workspace="business"/>}/>
    <Route path="/fleet/*" element={<WorkspaceLanding workspace="fleet"/>}/>
    <Route path="/enterprise/*" element={<WorkspaceLanding workspace="enterprise"/>}/>
    <Route path="/admin/*" element={<WorkspaceLanding workspace="admin"/>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes>;
}

export function isConfigured() { return Boolean(supabase); }
export function configurationIcon() { return Database; }
