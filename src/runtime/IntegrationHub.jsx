import {Link} from 'react-router-dom';
import {Activity,Building2,Car,Compass,Globe2,ShieldCheck,Sparkles,Users,Database,Route as RouteIcon,Bell} from 'lucide-react';
import WorkspaceShell from './WorkspaceShell.jsx';

const surfaces=[
 ['Consumer','/consumer','Location → check-in → rating → evidence → progression',Compass],
 ['Map + Routing','/map','Discovery → canonical location → route → arrival → offline replay',RouteIcon],
 ['Play / Quest','/play','Quest → QR/geofence → task → XP → reward',Sparkles],
 ['Business','/business','Location → campaign → attribution → conversion → ROI',Building2],
 ['Fleet','/fleet','Route → stop → service event → metric → scorecard',Car],
 ['Enterprise','/enterprise','Network → partner → campaign → outcome → intelligence',Globe2],
 ['Community','/community','Review/evidence → reputation → trusted-source signal',Users],
 ['Intelligence','/intelligence','Fact → signal → action → new fact',Activity],
 ['Data + Evidence','/evidence','Observation → provenance → confidence → verification → contradiction',Database],
 ['Notifications','/notifications','Event → priority → delivery → read state → live refresh',Bell],
 ['Admin','/admin','Observe → authorize → resolve → govern',ShieldCheck],
];
export default function IntegrationHub(){return <WorkspaceShell workspace="owner"><section className="page"><div className="page-header"><div><span className="eyebrow">PLATFORM WIRING</span><h1>Integration map</h1><p>Cross-tier navigation into the canonical product surfaces. Product workflows live in their domains; this page only maps the runtime graph.</p></div></div><div className="detail-grid">{surfaces.map(([name,path,flow,Icon])=><Link className="detail-panel" key={path} to={path}><div className="panel-heading"><div><span className="eyebrow">CANONICAL SURFACE</span><h2>{name}</h2></div><Icon size={22}/></div><p>{flow}</p><span className="secondary">Open surface</span></Link>)}</div><div className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">INTEROPERABILITY CONTRACT</span><h2>One graph, canonical boundaries</h2></div><ShieldCheck size={22}/></div><p>Shared Supabase datasets and service contracts terminate in one UI surface per domain. Map/routing, evidence/provenance, notifications, progression, Business, Fleet and Enterprise remain interoperable without creating duplicate runtimes.</p><div className="hero-actions"><Link className="secondary" to="/capabilities">Capability Hub</Link><Link className="secondary" to="/integration">Refresh wiring map</Link></div></div><div className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">ARCHITECTURE RULE</span><h2>One product surface per domain</h2></div><ShieldCheck size={22}/></div><p>IntegrationHub does not embed ConsumerActionCenter, EngagementOrchestrator, or duplicate domain workflows. Those capabilities are reached through their canonical routes.</p></div></section></WorkspaceShell>}