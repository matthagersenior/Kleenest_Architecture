import { useEffect, useState } from 'react';
import { Navigation, LocateFixed, MapPin, Play, CheckCircle2, Clock3, Route as RouteIcon } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import WorkspaceShell from './WorkspaceShell.jsx';
import { useAppContext } from '../AppContext.jsx';

const formatDistance = route => route?.distanceKm != null ? `${route.distanceKm} km` : route?.distanceMeters != null ? `${(route.distanceMeters / 1609.344).toFixed(1)} mi` : '—';
const formatDuration = route => route?.durationMinutes != null ? `${route.durationMinutes} min` : route?.durationSeconds != null ? `${Math.max(1, Math.round(route.durationSeconds / 60))} min` : '—';

export default function RouteSurface() {
  const { services, configured, user } = useAppContext();
  const [params] = useSearchParams();
  const [origin, setOrigin] = useState(params.get('origin') || '');
  const [destination, setDestination] = useState(params.get('destination') || '');
  const [locationId, setLocationId] = useState(params.get('locationId') || '');
  const [route, setRoute] = useState(null);
  const [status, setStatus] = useState('Enter an origin and destination.');
  const [busy, setBusy] = useState('');

  useEffect(() => {
    if (origin || !navigator.geolocation) return;
    let active = true;
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      if (active) setOrigin(`${coords.latitude},${coords.longitude}`);
    }, () => {}, { enableHighAccuracy: true, timeout: 10000, maximumAge: 120000 });
    return () => { active = false; };
  }, [origin]);

  const useGps = () => {
    if (!navigator.geolocation) return setStatus('GPS is unavailable on this device.');
    setBusy('gps');
    setStatus('Getting your current location…');
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      setOrigin(`${coords.latitude},${coords.longitude}`);
      setStatus('Current GPS position loaded as origin.');
      setBusy('');
    }, () => {
      setStatus('Location permission was unavailable.');
      setBusy('');
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 120000 });
  };

  const request = async () => {
    setBusy('route');
    try {
      setStatus('Locating destinations and building route geometry…');
      const data = await services.routing.request({ origin: origin.trim(), destination: destination.trim(), locationId: locationId || null });
      setRoute(data);
      const resolvedLocationId = data?.locationId || locationId || '';
      setLocationId(resolvedLocationId);
      setStatus('Route ready.');
      window.dispatchEvent(new CustomEvent('kleenest:route-updated', { detail: { locationId: resolvedLocationId, route: data } }));
    } catch (e) {
      setRoute(null);
      setStatus(e?.message || 'Unable to build route.');
    } finally { setBusy(''); }
  };

  const lifecycle = async (action, label) => {
    if (!user) return setStatus('Sign in to publish route lifecycle events.');
    setBusy(action);
    try {
      const resolvedLocationId = locationId || route?.locationId || null;
      await services.routing[action]({ locationId: resolvedLocationId, route: route ? { ...route, locationId: resolvedLocationId } : route });
      setStatus(label);
      window.dispatchEvent(new CustomEvent('kleenest:route-updated', { detail: { locationId: resolvedLocationId, action } }));
    } catch (e) { setStatus(e?.message || `Unable to ${action} route.`); }
    finally { setBusy(''); }
  };

  return <WorkspaceShell workspace="consumer"><section className="page business-page">
    <div className="page-header"><div><span className="eyebrow">ROUTES</span><h1>Plan a route</h1><p>Build real route geometry from your current position or an address, then optionally publish arrival lifecycle events to the authenticated network.</p></div><div className="hero-actions"><button className="secondary" onClick={useGps} disabled={busy!==''}><LocateFixed size={16}/>Use GPS origin</button></div></div>
    <section className="detail-panel"><label>Origin<input value={origin} onChange={e=>setOrigin(e.target.value)} placeholder="Current location, address, or coordinates"/></label><label>Destination<input value={destination} onChange={e=>setDestination(e.target.value)} placeholder="Destination"/></label><label>Destination location ID<input value={locationId} onChange={e=>setLocationId(e.target.value)} placeholder="Optional canonical location ID"/></label><button className="primary" disabled={!configured||busy!==''||!origin.trim()||!destination.trim()} onClick={request}><Navigation size={16}/>{busy==='route'?'Building route…':'Build route'}</button><p className="muted">{user?'Route lifecycle events are connected to the authenticated network.':'Route geometry works without sign-in; sign in to publish lifecycle events.'}</p></section>
    {route&&<><section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">ROUTE READY</span><h2>{route.origin||origin} → {route.destination||destination}</h2></div><RouteIcon size={22}/></div><div className="detail-grid"><div className="metric-card"><strong>{formatDistance(route)}</strong><span>distance</span></div><div className="metric-card"><strong>{formatDuration(route)}</strong><span>estimated time</span></div><div className="metric-card"><strong>{route.routingProvider||'canonical'}</strong><span>routing provider</span></div></div><div className="button-row"><button className="button" disabled={busy!==''} onClick={()=>lifecycle('start','Route started.')}><Play size={15}/>Start</button><button className="button" disabled={busy!==''} onClick={()=>lifecycle('approaching','Approaching destination.')}>Approaching</button><button className="button" disabled={busy!==''} onClick={()=>lifecycle('arrived','Arrived.')}>Arrived</button><button className="button" disabled={busy!==''} onClick={()=>lifecycle('departed','Departed.')}>Departed</button></div></section>{Array.isArray(route.steps)&&route.steps.length>0&&<section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">TURN-BY-TURN</span><h2>Route steps</h2></div><Clock3 size={21}/></div><ol className="route-steps">{route.steps.slice(0,30).map((step,index)=><li key={`${index}-${step.instruction}`}><strong>{index+1}</strong><div><span>{step.instruction}</span><small>{step.distanceMeters != null ? `${Math.round(step.distanceMeters)} m` : ''}{step.durationSeconds != null ? ` · ${Math.max(1,Math.round(step.durationSeconds/60))} min` : ''}</small></div></li>)}</ol></section>}</>}
    <div className="state" role="status"><CheckCircle2 size={16}/>{status}</div>
  </section></WorkspaceShell>;
}
