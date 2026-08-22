import { useAppContext } from '../AppContext.jsx';
import ConsumerActionCenter from './ConsumerActionCenter.jsx';
import EngagementOrchestrator from './EngagementOrchestrator.jsx';

const surfaces = [
  ['Consumer', '/consumer', 'Location → check-in → rating → evidence → progression'],
  ['Play / Quest', '/play', 'Quest → QR/geofence → task → XP → reward'],
  ['Business', '/business', 'Location → campaign → attribution → conversion → ROI'],
  ['Fleet', '/fleet', 'Route → stop → service event → metric → scorecard'],
  ['Enterprise', '/enterprise', 'Network → partner → campaign → outcome → intelligence'],
  ['Community', '/community', 'Review/evidence → reputation → trusted-source signal'],
  ['Intelligence', '/intelligence', 'Fact → signal → action → new fact'],
  ['Admin', '/admin', 'Observe → authorize → resolve → govern'],
];

function SurfaceCard({ name, path, flow }) {
  return <a href={path} style={{display:'block',padding:16,border:'1px solid #26324f',borderRadius:14,textDecoration:'none',color:'inherit',background:'#0f172a'}}>
    <strong>{name}</strong><div style={{color:'#94a3b8',fontSize:13,marginTop:6}}>{flow}</div>
  </a>;
}

export default function IntegrationHub() {
  const { services, capabilityRegistry } = useAppContext();
  return <main className="workspace-shell">
    <section className="page-heading"><span className="eyebrow">Kleenest</span><h1>Full Wiring Hub</h1><p>Canonical runtime integration surface for the cross-tier event graph.</p></section>
    <section className="capability-panel">
      <h2>Canonical surfaces</h2>
      <div className="action-grid">{surfaces.map(([name,path,flow]) => <SurfaceCard key={path} name={name} path={path} flow={flow}/>)}</div>
    </section>
    <ConsumerActionCenter />
    <EngagementOrchestrator />
    <section className="capability-panel">
      <h2>Runtime contract status</h2>
      <p>Services registered: {services ? Object.keys(services).length : 0}. Capability definitions: {Object.keys(capabilityRegistry || {}).length}.</p>
      <p>Writes remain behind the authenticated service layer; the static Pages surface remains deployment-safe.</p>
    </section>
  </main>;
}
