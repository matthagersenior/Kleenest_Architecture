import { useEffect, useState } from 'react';
import { Navigation, LocateFixed, MapPin, Play, CheckCircle2, Clock3, Route as RouteIcon, Sparkles, Plus, Trash2, Trophy, ExternalLink } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import WorkspaceShell from './WorkspaceShell.jsx';
import { useAppContext } from '../AppContext.jsx';

const formatDistance = r => r?.distanceKm != null ? `${Number(r.distanceKm).toFixed(1)} km` : r?.distanceMeters != null ? `${(r.distanceMeters / 1609.344).toFixed(1)} mi` : '—';
const formatDuration = r => r?.durationMinutes != null ? `${Math.round(r.durationMinutes)} min` : r?.durationSeconds != null ? `${Math.max(1, Math.round(r.durationSeconds / 60))} min` : '—';
const destinationLabel = (route, destination, stopName) => route?.destination || destination || stopName || (route?.locationId ? 'Selected restroom' : 'Destination');

export default function RouteSurface() {
  const { services, configured, user } = useAppContext();
  const [params] = useSearchParams();
  const initialLocationId = params.get('locationId') || '';
  const [origin, setOrigin] = useState(params.get('origin') || '');
  const [destination, setDestination] = useState(params.get('destination') || '');
  const [locationId, setLocationId] = useState(initialLocationId);
  const [stops, setStops] = useState(initialLocationId ? [initialLocationId] : []);
  const [stopName, setStopName] = useState('');
  const [stopAddress, setStopAddress] = useState('');
  const [route, setRoute] = useState(null);
  const [status, setStatus] = useState(initialLocationId ? 'Restroom stop selected. Ready to build your route.' : 'Start with where you are going, or choose a restroom stop from Explore stops.');
  const [busy, setBusy] = useState('');

  useEffect(() => {
    if (!initialLocationId || !services?.locations) return undefined;
    let active = true;
    services.locations.getById(initialLocationId).then(place => {
      if (!active || !place) return;
      setStopName(place.name || 'Restroom stop');
      setStopAddress([place.address, place.city, place.state].filter(Boolean).join(', '));
    }).catch(() => {});
    return () => { active = false; };
  }, [initialLocationId, services]);

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
    if (value && !stops.includes(value)) {
      setStops(v => [...v, value]);
      setStatus('Restroom stop added.');
      setLocationId('');
      setStopName('');
      setStopAddress('');
    }
  };
  const removeStop = stop => {
    setStops(v => v.filter(x => x !== stop));
    if (stop === locationId) setLocationId('');
    if (stop === initialLocationId) { setStopName(''); setStopAddress(''); }
    setStatus('Restroom stop removed.');
  };

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
        <header className="route-hero page-header">
          <div className="route-hero-copy">
            <span className="eyebrow">SMART ROUTES</span>
            <h1>Plan the trip, not just the destination.</h1>
            <p>Build a route around where you are going and the restroom stops that make the trip easier.</p>
          </div>
          <button className="button secondary route-gps" onClick={useGps} disabled={busy !== ''}><LocateFixed size={17} />Use my location</button>
        </header>

        <section className="detail-panel route-planner">
          <div className="panel-heading route-panel-heading">
            <div><span className="eyebrow">PLAN</span><h2>Where are you starting and going?</h2></div>
            <div className="route-heading-icon"><Navigation size={20} /></div>
          </div>
          <div className="route-fields">
            <label>Starting point<input value={origin} onChange={e => setOrigin(e.target.value)} placeholder="Current location or address" /></label>
            <label>Destination <span className="muted">optional when a restroom stop is selected</span><input value={destination} onChange={e => setDestination(e.target.value)} placeholder="Where are you going?" /></label>
          </div>
          <div className="route-stop-picker">
            <div className="route-stop-picker-heading">
              <div><span className="route-field-title">Restroom stops</span><span className="route-field-help">Choose stops from the map instead of entering an internal ID.</span></div>
              <Link className="button secondary route-explore" to="/map"><MapPin size={15} />Explore stops</Link>
            </div>
            {stopName || initialLocationId ? (
              <div className="selected-stop-card">
                <div className="selected-stop-icon"><MapPin size={18} /></div>
                <div className="selected-stop-copy"><strong>{stopName || 'Selected restroom'}</strong><span>{stopAddress || 'Selected from your saved or mapped locations'}</span></div>
                <button className="icon-button" onClick={() => removeStop(initialLocationId)} aria-label="Remove selected restroom"><Trash2 size={16} /></button>
              </div>
            ) : (
              <div className="stop-empty"><MapPin size={18} /><span>No restroom stop selected yet.</span><Link to="/map">Choose one on the map</Link></div>
            )}
            {locationId && locationId !== initialLocationId && <div className="manual-stop-row"><input value={locationId} onChange={e => setLocationId(e.target.value)} placeholder="Paste a location ID" aria-label="Location ID" /><button className="button secondary" onClick={addStop}><Plus size={15} />Add stop</button></div>}
          </div>
          {stops.length > 0 && <div className="route-stop-list">{stops.map((s, i) => <div className="route-stop" key={s}><span className="route-stop-number">{i + 1}</span><div><strong>{s === initialLocationId && stopName ? stopName : 'Restroom stop'}</strong>{s === initialLocationId && stopAddress && <small>{stopAddress}</small>}</div><button className="icon-button" onClick={() => removeStop(s)} aria-label="Remove stop"><Trash2 size={15} /></button></div>)}</div>}
          <div className="route-actions">
            <button className="button primary route-build" disabled={!configured || busy !== '' || !origin.trim() || (!destination.trim() && !stops.length && !locationId.trim())} onClick={request}><Navigation size={16} />{busy === 'route' ? 'Building route…' : 'Build my route'}</button>
            {!initialLocationId && !locationId && <Link className="button secondary" to="/map"><MapPin size={15} />Explore stops</Link>}
          </div>
          <div className="route-status" role="status"><Sparkles size={16} />{status}</div>
        </section>

        {route && <>
          <section className="detail-panel route-result">
            <div className="panel-heading"><div><span className="eyebrow">ROUTE READY</span><h2>{route.origin || origin} → {destinationLabel(route, destination, stopName)}</h2></div><RouteIcon size={22} /></div>
            <div className="route-metrics"><div className="metric-card"><strong>{formatDistance(route)}</strong><span>distance</span></div><div className="metric-card"><strong>{formatDuration(route)}</strong><span>estimated time</span></div><div className="metric-card"><strong>{route.stopLocationIds?.length ?? stops.length}</strong><span>restroom stops</span></div></div>
            <div className="route-actions route-result-actions"><button className="button primary" onClick={() => lifecycle('start', 'Route started.')} disabled={busy !== ''}><Play size={15} />Start route</button><button className="button secondary" onClick={() => lifecycle('approaching', 'You are approaching your destination.')} disabled={busy !== ''}><MapPin size={15} />Approaching</button><button className="button secondary" onClick={() => lifecycle('arrived', 'Arrival recorded.')} disabled={busy !== ''}><CheckCircle2 size={15} />Arrived</button><button className="button secondary" onClick={openExternalNavigation}><ExternalLink size={15} />Open navigation</button><Link className="button secondary" to="/play/quest"><Trophy size={15} />Trust Quests</Link></div>
          </section>
          {Array.isArray(route.steps) && route.steps.length > 0 && <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">YOUR TRIP</span><h2>Turn-by-turn</h2></div><Clock3 size={21} /></div><ol className="route-steps">{route.steps.slice(0, 30).map((s, i) => <li key={`${i}-${s.instruction}`}><strong>{i + 1}</strong><div><span>{s.instruction}</span><small>{s.distanceMeters != null ? `${Math.round(s.distanceMeters)} m` : ''}{s.durationSeconds != null ? ` · ${Math.max(1, Math.round(s.durationSeconds / 60))} min` : ''}</small></div></li>)}</ol></section>}
        </>}
      </main>
    </WorkspaceShell>
  );
}
