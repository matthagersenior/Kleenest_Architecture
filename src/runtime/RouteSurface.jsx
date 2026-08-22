import { useState } from 'react';
import { useAppContext } from '../AppContext.jsx';
import WorkspaceShell from './WorkspaceShell.jsx';
export default function RouteSurface() {
  const { services, configured } = useAppContext();
  const [origin, setOrigin] = useState(''); const [destination, setDestination] = useState(''); const [route, setRoute] = useState(null); const [status, setStatus] = useState('Enter an origin and destination.');
  const request = async () => { try { setStatus('Building route…'); setRoute(await services.routing.request({ origin, destination })); setStatus('Route ready.'); } catch (error) { setStatus(error.message); } };
  const start = async () => { try { await services.routing.start({ route }); setStatus('Route started.'); } catch (error) { setStatus(error.message); } };
  return <WorkspaceShell><section className="page-head"><span className="eyebrow">Routes</span><h1>Plan a route</h1><p>Routing actions feed the live network.</p><label>Origin<input value={origin} onChange={e => setOrigin(e.target.value)} placeholder="Current location or place" /></label><label>Destination<input value={destination} onChange={e => setDestination(e.target.value)} placeholder="Destination" /></label><button className="button primary" disabled={!configured || !origin || !destination} onClick={request}>Build route</button>{route && <article className="result-card"><strong>{route.origin} → {route.destination}</strong><button className="button" onClick={start}>Start route</button></article>}<span>{status}</span></section></WorkspaceShell>;
}
