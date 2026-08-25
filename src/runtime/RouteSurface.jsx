import { useEffect, useState } from 'react';
import { Navigation, LocateFixed, MapPin, Play, CheckCircle2, Clock3, Route as RouteIcon, Sparkles, Plus, Trash2, Trophy, ExternalLink } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import WorkspaceShell from './WorkspaceShell.jsx';
import { useAppContext } from '../AppContext.jsx';

const formatDistance = (r) => r?.distanceKm != null ? `${Number(r.distanceKm).toFixed(1)} km` : r?.distanceMeters != null ? `${(r.distanceMeters / 1609.344).toFixed(1)} mi` : '—';
const formatDuration = (r) => r?.durationMinutes != null ? `${Math.round(r.durationMinutes)} min` : r?.durationSeconds != null ? `${Math.max(1, Math.round(r.durationSeconds / 60))} min` : '—';
const destinationLabel = (route, destination) => route?.destination || destination || (route?.locationId ? 'Selected restroom' : 'Destination');

export default function RouteSurface() {
  const { services, configured, user } = useAppContext();
  const [params] = useSearchParams();
  const [origin, setOrigin] = useState(params.get('origin') || '');
  const [destination, setDestination] = useState(params.get('destination') || '');
  const initialLocationId = params.get('locationId') || '';
  const [locationId, setLocationId] = useState(initialLocationId);
  const [stops, setStops] = useState(initialLocationId ? [initialLocationId] : []);
  const [route, setRoute] = useState(null);
  const [status, setStatus] = useState(initialLocationId ? 'Restroom selected. Ready to build your route.' : 'Start with where you are going, or choose a restroom stop from the map.');
  const [busy, setBusy] = useState('');

  useEffect(() => {
    if (origin || !navigator.geolocation) return undefined;
    let active = true;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => active && setOrigin(`${coords.latitude},${coords.longitude}`),
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 120000 },
    );
    return () => { active = false; };
  }, [origin]);

  const useGps = () => {
    if (!navigator.geolocation) return setStatus('GPS is unavailable on this device.');
    setBusy('gps');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { setOrigin(`${coords.latitude},${coords.longitude}`); setStatus('Starting point updated.'); setBusy(''); },
      () => { setStatus('Location permission was unavailable. Enter an address instead.'); setBusy(''); },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 120000 },
    );
  };

  const addStop = () => {
    const value = locationId.trim();
    if (value && !stops.includes(value)) { setStops((v) => [...v, value]); setLocationId(''); setStatus('Restroom stop added.'); }
  };
  const removeStop = (stop) => setStops((v) => v.filter((x) => x !== stop));

  const request = async () => {
    setBusy('route');
    try {
      const selectedStops = stops.length ? stops : (locationId ? [locationId] : []);
      setStatus(selectedStops.length ? 'Building the route through your restroom stops…' : 'Building your route…');
      const data = await services.routing.request({ origin: origin.trim(), destination: destination.trim(), locationId: selectedStops[selectedStops.length - 1] || null, stopLocationIds: selectedStops });
      setRoute(data);
      setStatus('Route ready.');
      window.dispatchEvent(new CustomEvent('kleenest:route-updated', { detail: { locationId: data?.locationId || selectedStops[selectedStops.length - 1] || null, route: data } }));
    } catch (e) {
      setRoute(null);
      setStatus(e?.message || 'We could not build that route.');
    } finally { setBusy(''); }
  };

  const lifecycle = async (action, label) => {
    if (!user) return setStatus('Sign in to share route progress.');
    setBusy(action);
    try {
      await services.routing[action]({ locationId: route?.locationId || stops[stops.length - 1] || null, route: route ? { ...route, stopLocationIds: stops } : route });
      setStatus(label);
      window.dispatchEvent(new CustomEvent('kleenest:route-updated', { detail: { action, route } }));
    } catch (e) { setStatus(e?.message || `Unable to ${action} route.`); }
    finally { setBusy(''); }
  };

  const openExternalNavigation = () => {
    const target = destination || (route?.destination && route.destination !== 'Selected destination' ? route.destination : '');
    if (!target) return setStatus('Build a route to a named destination before opening navigation.');
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(target)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <WorkspaceShell workspace="consumer">
      <main className="page route-page">
        <div className="page-header">
          <div><span className="eyebrow">SMART ROUTES</span><h1>Plan the trip, not just the destination.</h1><p>Build a route around where you are going and the restroom stops that make the trip easier.</p></div>
          <button className="secondary" onClick={useGps} disabled={busy !== ''}><LocateFixed size={16} />Use my location</button>
        </div>
        <section className="detail-panel">
          <div className="panel-heading"><div><span className="eyebrow">PLAN</span><h2>Where are you starting and going?</h2></div><Navigation size={21} /></div>
          <div className="detail-grid"><label>Starting point<input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Current location or address" /></label><label>Destination <span className="muted">optional when a restroom stop is selected</span><input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Where are you going?" /></label></div>
          <div className="stop-builder"><label>Restroom stop<input value={locationId} onChange={(e) => setLocationId(e.target.value)} placeholder="Location ID from a saved place or map" /></label><button className="secondary" onClick={addStop} disabled={!locationId.trim()}><Plus size={15} />Add stop</button></div>
          {stops.length > 0 && <div className="route-stop-list">{stops.map((s, i) => <div className="route-stop" key={s}><span>{i + 1}</span><strong>Restroom stop</strong><code>{s}</code><button className="text-link" onClick={() => removeStop(s)} aria-label="Remove stop"><Trash2 size={15} /></button></div>)}</div>}
          <div className="button-row"><button className="primary" disabled={!configured || busy !== '' || !origin.trim() || (!destination.trim() && !stops.length && !locationId.trim())} onClick={request}><Navigation size={16} />{busy === 'route' ? 'Building route…' : 'Build my route'}</button><Link className="button secondary" to="/map"><MapPin size={15} />Explore stops</Link></div>
          <div className="state" role="status"><Sparkles size={16} />{status}</div>
        </section>
        {route && <>
          <section className="detail-panel route-result"><div className="panel-heading"><div><span className="eyebrow">ROUTE READY</span><h2>{route.origin || origin} → {destinationLabel(route, destination)}</h2></div><RouteIcon size={22} /></div><div className="detail-grid"><div className="metric-card"><strong>{formatDistance(route)}</strong><span>distance</span></div><div className="metric-card"><strong>{formatDuration(route)}</strong><span>estimated time</span></div><div className="metric-card"><strong>{route.stopLocationIds?.length ?? stops.length}</strong><span>restroom stops</span></div></div><div className="button-row"><button className="button primary" onClick={() => lifecycle('start', 'Route started.')} disabled={busy !== ''}><Play size={15} />Start route</button><button className="button" onClick={() => lifecycle('approaching', 'You are approaching your destination.')} disabled={busy !== ''}><MapPin size={15} />Approaching</button><button className="button" onClick={() => lifecycle('arrived', 'Arrival recorded.')} disabled={busy !== ''}><CheckCircle2 size={15} />Arrived</button><button className="button secondary" onClick={openExternalNavigation}><ExternalLink size={15} />Open navigation</button><Link className="button secondary" to="/play/quest"><Trophy size={15} />Trust Quests</Link></div></section>
          {Array.isArray(route.steps) && route.steps.length > 0 && <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">YOUR TRIP</span><h2>Turn-by-turn</h2></div><Clock3 size={21} /></div><ol className="route-steps">{route.steps.slice(0, 30).map((s, i) => <li key={`${i}-${s.instruction}`}><strong>{i + 1}</strong><div><span>{s.instruction}</span><small>{s.distanceMeters != null ? `${Math.round(s.distanceMeters)} m` : ''}{s.durationSeconds != null ? ` · ${Math.max(1, Math.round(s.durationSeconds / 60))} min` : ''}</small></div></li>)}</ol></section>}
        </>}
      </main>
    </WorkspaceShell>
  );
}
