import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Clock3, ExternalLink, LocateFixed, MapPin, Navigation, Play, Route as RouteIcon, Sparkles, Trash2, Trophy } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import WorkspaceShell from './WorkspaceShell.jsx';
import { useAppContext } from '../AppContext.jsx';
import { createRouteCache } from '../domains/routing/cache.js';
import './RouteSurface.css';

const DRAFT_KEY = 'kleenest.routeDraft.v1';
const readDraft = () => { try { const x = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null'); return x && typeof x === 'object' ? x : null; } catch { return null; } };
const writeDraft = x => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(x)); } catch {} };
const hasCoords = x => Number.isFinite(Number(x?.latitude)) && Number.isFinite(Number(x?.longitude));
const asStop = (value, fallbackId = '') => { if (!value) return null; if (typeof value === 'string') return { locationId: value, validation: 'pending' }; return { locationId: String(value.locationId || value.id || fallbackId), name: value.name || value.brand || 'Restroom stop', address: value.address || '', latitude: value.latitude, longitude: value.longitude, bathroomStatus: value.bathroomStatus || value.bathroom_status, bathroomAccess: value.bathroomAccess || value.bathroom_access, bathroomConfidence: value.bathroomConfidence ?? value.bathroom_confidence, bathroomEvidenceCount: value.bathroomEvidenceCount ?? value.bathroom_evidence_count, validation: value.validation || (hasCoords(value) ? 'valid' : 'pending') }; };
const formatDistance = route => route?.distanceKm != null ? `${Number(route.distanceKm).toFixed(1)} km` : route?.distanceMeters != null ? `${(Number(route.distanceMeters) / 1609.344).toFixed(1)} mi` : '—';
const formatDuration = route => route?.durationMinutes != null ? `${Math.round(route.durationMinutes)} min` : route?.durationSeconds != null ? `${Math.max(1, Math.round(route.durationSeconds / 60))} min` : '—';
const coordinate = p => Array.isArray(p) && p.length >= 2 && Number.isFinite(Number(p[0])) && Number.isFinite(Number(p[1])) ? `${Number(p[1])},${Number(p[0])}` : '';
const navigationUrl = route => { const origin = coordinate(route?.originCoordinates), destination = coordinate(route?.destinationCoordinates); if (!origin || !destination) return ''; const stops = Array.isArray(route?.stopCoordinates) ? route.stopCoordinates.map(coordinate).filter(Boolean) : []; const named = String(route?.destination || '').trim() && route.destination !== 'Selected destination'; const waypoints = named ? stops : stops.slice(0, -1); const params = new URLSearchParams({ api: '1', origin, destination }); if (waypoints.length) params.set('waypoints', waypoints.join('|')); return `https://www.google.com/maps/dir/?${params.toString()}`; };

export default function RouteSurfaceFixed() {
  const { services, configured, user } = useAppContext();
  const [params] = useSearchParams();
  const initialLocationId = params.get('locationId') || params.get('add') || '';
  const draft = useMemo(readDraft, [initialLocationId]);
  const [origin, setOrigin] = useState(params.get('origin') || draft?.origin || '');
  const [destination, setDestination] = useState(params.get('destination') || draft?.destination || '');
  const [stops, setStops] = useState(() => { const raw = Array.isArray(draft?.stops) ? draft.stops : []; const next = raw.map((s, i) => asStop(s, draft?.stopLocationIds?.[i])).filter(Boolean); if (initialLocationId && !next.some(s => s.locationId === initialLocationId)) next.push(asStop(initialLocationId)); return next; });
  const [route, setRoute] = useState(null), [status, setStatus] = useState(initialLocationId ? 'Location selected. Build the route when your starting point and destination are ready.' : 'Start with where you are going, or choose restroom stops from the map.'), [busy, setBusy] = useState('');
  const cache = useRef(null), generation = useRef(0);

  useEffect(() => { cache.current = createRouteCache(); const active = cache.current.getActive?.(); if (active?.routeId) { setRoute(active); setOrigin(active.origin || ''); setDestination(active.destination || ''); setStatus('Active route recovered.'); } }, []);
  useEffect(() => { const d = readDraft() || {}; writeDraft({ ...d, origin, destination, stops, stopLocationIds: stops.map(s => s.locationId), updatedAt: Date.now() }); }, [origin, destination, stops]);
  useEffect(() => { if (!initialLocationId || !services?.locations?.getById) return; if (stops.some(s => s.locationId === initialLocationId && s.name && s.name !== 'Restroom stop')) return; let cancelled = false; void services.locations.getById(initialLocationId).then(place => { if (cancelled || !place) return; const next = asStop({ ...place, locationId: initialLocationId, validation: hasCoords(place) ? 'valid' : 'stale' }, initialLocationId); setStops(current => current.map(s => s.locationId === initialLocationId ? next : s)); }).catch(() => {}); return () => { cancelled = true; }; }, [initialLocationId, services?.locations?.getById]);

  const useGps = () => { if (!navigator.geolocation) return setStatus('GPS is unavailable on this device.'); setBusy('gps'); navigator.geolocation.getCurrentPosition(p => { setOrigin(`${p.coords.latitude},${p.coords.longitude}`); setRoute(null); setStatus('Starting point updated.'); setBusy(''); }, () => { setStatus('Location permission was unavailable. Enter a starting address instead.'); setBusy(''); }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 120000 }); };
  const removeStop = id => { setStops(v => v.filter(s => s.locationId !== id)); setRoute(null); setStatus('Restroom stop removed.'); };
  const clearStops = () => { setStops([]); setRoute(null); setStatus('Restroom stops cleared.'); };
  const build = async () => {
    if (!origin.trim()) return setStatus('Enter a starting point before building the route.');
    if (!destination.trim() && !stops.length) return setStatus('Add a destination or at least one restroom stop.');
    const invalid = stops.filter(s => !hasCoords(s)); if (invalid.length) return setStatus('A selected stop is still resolving. Wait a moment or remove and re-add it.');
    if (!services?.routing?.request) return setStatus('Routing service is not configured.');
    const gen = ++generation.current; setBusy('route'); setStatus(stops.length ? `Building the route through ${stops.length} restroom stop${stops.length === 1 ? '' : 's'}…` : 'Building your route…');
    try { const data = await services.routing.request({ origin: origin.trim(), destination: destination.trim(), locationId: stops.at(-1)?.locationId || null, stopLocationIds: stops.map(s => s.locationId) }); if (gen !== generation.current) return; if (!Array.isArray(data?.destinationCoordinates) || !hasCoords({ latitude: data.destinationCoordinates[1], longitude: data.destinationCoordinates[0] })) throw new Error('The destination could not be resolved to GPS coordinates.'); const next = { ...data, stopLocationIds: data.stopLocationIds || stops.map(s => s.locationId) }; setRoute(next); cache.current?.setActive?.(next); setStatus('Route ready.'); } catch (e) { if (gen === generation.current) { setRoute(null); setStatus(e?.message || 'We could not build that route.'); } } finally { if (gen === generation.current) setBusy(''); }
  };
  const lifecycle = async action => {
    if (!user) return setStatus('Sign in to share route progress.');
    const url = navigationUrl(route); if (action === 'start' && !url) return setStatus('This route has no usable GPS destination. Rebuild the route first.');
    if (!services?.routing?.[action]) return setStatus(`Route action ${action} is not configured.`);
    const gen = ++generation.current; setBusy(action);
    try {
      const result = await services.routing[action]({ locationId: route?.locationId || stops.at(-1)?.locationId || null, route: route ? { ...route, stopLocationIds: stops.map(s => s.locationId) } : null });
      if (gen !== generation.current) return;
      const active = result?.route || route; if (active) { setRoute(active); cache.current?.setActive?.(active); }
      setStatus(action === 'start' ? 'Route started. Opening navigation…' : action === 'approaching' ? 'Approaching status recorded.' : 'Arrival recorded.');
      if (action === 'start') { window.location.assign(navigationUrl(active || route)); }
    } catch (e) { if (gen === generation.current) setStatus(e?.message || `Unable to ${action} route.`); } finally { if (gen === generation.current) setBusy(''); }
  };
  const openNavigation = () => { const url = navigationUrl(route); if (!url) return setStatus('Build a route with a resolved destination before opening navigation.'); window.location.assign(url); };

  return <WorkspaceShell workspace="consumer"><main className="page route-page">
    <header className="route-hero page-header"><div className="route-hero-copy"><span className="eyebrow">SMART ROUTES</span><h1>Plan the trip, not just the destination.</h1><p>Build a route around where you are going and the restroom stops that make the trip easier.</p></div><button className="button secondary route-gps" onClick={useGps} disabled={busy !== ''}><LocateFixed size={17}/>Use my location</button></header>
    <section className="detail-panel route-planner"><div className="panel-heading route-panel-heading"><div><span className="eyebrow">PLAN</span><h2>Where are you starting and going?</h2></div><Navigation size={20}/></div>
      <div className="route-fields"><label>Starting point<input value={origin} onChange={e => { setOrigin(e.target.value); setRoute(null); }} placeholder="Current location or address"/></label><label>Destination <span className="muted">optional when restroom stops are selected</span><input value={destination} onChange={e => { setDestination(e.target.value); setRoute(null); }} placeholder="Where are you going?"/></label></div>
      <div className="route-stop-picker"><div className="route-stop-picker-heading"><div><span className="route-field-title">Restroom stops · {stops.length}</span><span className="route-field-help">Add stops from the canonical map.</span></div><div className="route-actions"><Link className="button secondary" to="/map"><MapPin size={15}/>Add from map</Link>{stops.length > 0 && <button className="button secondary" onClick={clearStops}><Trash2 size={15}/>Clear stops</button>}</div></div>
        {stops.length === 0 ? <div className="stop-empty"><MapPin size={18}/><span>No restroom stops selected yet.</span><Link to="/map">Choose stops on the map</Link></div> : <div className="route-stop-list">{stops.map((s, i) => <div className="route-stop" key={s.locationId}><span className="route-stop-number">{i + 1}</span><div className="route-stop-main"><strong>{s.name || 'Restroom stop'}</strong>{s.address && <small>{s.address}</small>}</div><button className="icon-button" onClick={() => removeStop(s.locationId)} disabled={busy !== ''} aria-label="Remove stop"><Trash2 size={15}/></button></div>)}</div>}
      </div><div className="route-actions"><button className="button primary route-build" disabled={!configured || busy !== '' || !origin.trim() || (!destination.trim() && !stops.length)} onClick={() => void build()}><Navigation size={16}/>{busy === 'route' ? 'Building route…' : 'Build my route'}</button></div><div className="route-status" role="status"><Sparkles size={16}/>{status}</div>
    </section>
    {route && <><section className="detail-panel route-result"><div className="panel-heading"><div><span className="eyebrow">ROUTE READY</span><h2>{route.origin || origin} → {route.destination || destination || stops.at(-1)?.name || 'Selected destination'}</h2></div><RouteIcon size={22}/></div><div className="route-metrics"><div className="metric-card"><strong>{formatDistance(route)}</strong><span>distance</span></div><div className="metric-card"><strong>{formatDuration(route)}</strong><span>estimated time</span></div><div className="metric-card"><strong>{route.stopLocationIds?.length ?? stops.length}</strong><span>restroom stops</span></div></div><div className="route-actions route-result-actions"><button className="button primary" onClick={() => void lifecycle('start')} disabled={busy !== ''}><Play size={15}/>{busy === 'start' ? 'Starting…' : 'Start route'}</button><button className="button secondary" onClick={() => void lifecycle('approaching')} disabled={busy !== ''}><MapPin size={15}/>Approaching</button><button className="button secondary" onClick={() => void lifecycle('arrived')} disabled={busy !== ''}><CheckCircle2 size={15}/>Arrived</button><button className="button secondary" onClick={openNavigation}><ExternalLink size={15}/>Open navigation</button><Link className="button secondary" to="/games"><Trophy size={15}/>Trust Quests</Link></div></section>{Array.isArray(route.steps) && route.steps.length > 0 && <section className="detail-panel"><div className="panel-heading"><div><span className="eyebrow">YOUR TRIP</span><h2>Turn-by-turn</h2></div><Clock3 size={21}/></div><ol className="route-steps">{route.steps.slice(0, 30).map((s, i) => <li key={`${i}-${s.instruction}`}><strong>{i + 1}</strong><div><span>{s.instruction}</span><small>{s.distanceMeters != null ? `${Math.round(s.distanceMeters)} m` : ''}{s.durationSeconds != null ? ` · ${Math.max(1, Math.round(s.durationSeconds / 60))} min` : ''}</small></div></li>)}</ol></section>}</>}
  </main></WorkspaceShell>;
}
