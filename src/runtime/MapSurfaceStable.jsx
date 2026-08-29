import L from 'leaflet';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { LocateFixed, Search, ShieldCheck, Route as RouteIcon, ExternalLink, MapPin, Phone, Globe2, Navigation, RefreshCw, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import WorkspaceShell from './WorkspaceShell.jsx';
import { useAppContext } from '../AppContext.jsx';
import { markerIcon, placeStatus, bathroomIntelligence, bathroomSignalLabel, safeText, placeBrand } from './MapMarkerSystem.jsx';
import './MapSurfaceV3.css';

const RADII = [1, 2, 5, 10, 25, 50];
const DEFAULT_RADIUS = 2;
const KM_PER_MILE = 1.609344;
const DEFAULT_CENTER = [38.627, -90.199];
const AMENITIES = Object.freeze([
  { id: 'restroom', label: 'Restroom', icon: '🚻' },
  { id: 'accessible_restroom', label: 'Accessible restroom', icon: '♿' },
  { id: 'wheelchair', label: 'Wheelchair accessible', icon: '♿' },
  { id: 'drinking_water', label: 'Drinking water', icon: '💧' },
  { id: 'baby_changing', label: 'Baby changing', icon: '🍼' },
  { id: 'shower', label: 'Shower', icon: '🚿' },
  { id: 'handwashing', label: 'Handwashing', icon: '🧼' },
  { id: 'seating', label: 'Seating', icon: '🪑' },
  { id: 'parking', label: 'Parking', icon: '🅿️' },
  { id: 'ev_charging', label: 'EV charging', icon: '⚡' },
  { id: 'wifi', label: 'Wi-Fi', icon: '📶' },
  { id: 'atm', label: 'ATM', icon: '🏧' },
]);
const lastLocation = () => { try { const x = JSON.parse(localStorage.getItem('kleenest.lastLocation') || 'null'); return Number.isFinite(+x?.latitude) && Number.isFinite(+x?.longitude) ? [+x.latitude, +x.longitude] : null; } catch { return null; } };
const hav = (a, b, c, d) => { const r = Math.PI / 180, x = (c - a) * r, y = (d - b) * r, q = Math.sin(x / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(y / 2) ** 2; return 6371008.8 * 2 * Math.atan2(Math.sqrt(q), Math.sqrt(1 - q)); };
const key = p => String(p?.location_id || p?.id || '');
const label = p => p?.name || p?.brand || p?.operator_name || 'Kleenest location';
const displayAddress = p => p?.address || p?.formatted_address || [p?.street_number, p?.street, p?.city, p?.state, p?.postal_code].filter(Boolean).join(', ') || [p?.city, p?.state, p?.postal_code].filter(Boolean).join(', ') || 'Address not yet available';
const sourceLabel = p => { const source = String(p?.source_dataset || p?.source || 'canonical').toLowerCase(); if (source.includes('openstreetmap') || source.includes('osm') || source.includes('overpass')) return 'OpenStreetMap / Overpass'; if (source.includes('offline')) return 'Offline pack'; return 'Kleenest canonical network'; };
const website = p => p?.website_url || p?.website || p?.websiteUrl || p?.url || '';
const amenityNames = selected => Object.entries(selected).filter(([, enabled]) => enabled).map(([name]) => name);

export default function MapSurfaceStable() {
  const { services, configured, loading, user } = useAppContext();
  const node = useRef(null), map = useRef(null), layer = useRef(null), seq = useRef(0), markerRefs = useRef(new Map());
  const [places, setPlaces] = useState([]), [origin, setOrigin] = useState(lastLocation), [radius, setRadius] = useState(DEFAULT_RADIUS), [amenities, setAmenities] = useState({}), [search, setSearch] = useState(''), [status, setStatus] = useState('Getting your location…'), [busy, setBusy] = useState(false), [selectedId, setSelectedId] = useState(''), [mapReady, setMapReady] = useState(false), [mapError, setMapError] = useState('');
  const selectedPlace = useMemo(() => places.find(p => key(p) === selectedId) || null, [places, selectedId]);
  const selectedAmenityNames = useMemo(() => amenityNames(amenities), [amenities]);
  const visible = useMemo(() => places.filter(p => {
    const q = search.trim().toLowerCase();
    if (q && !`${p.name || ''} ${p.brand || ''} ${p.operator_name || ''} ${displayAddress(p)} ${p.city || ''} ${p.state || ''} ${p.description || ''} ${Array.isArray(p.amenity_labels) ? p.amenity_labels.join(' ') : ''}`.toLowerCase().includes(q)) return false;
    const d = origin && Number.isFinite(+p.latitude) && Number.isFinite(+p.longitude) ? hav(origin[0], origin[1], +p.latitude, +p.longitude) : null;
    return d == null || d <= radius * 1609.344;
  }), [places, origin, radius, search]);

  const selectPlace = p => {
    const id = key(p); if (!id) return;
    setSelectedId(id);
    window.dispatchEvent(new CustomEvent('kleenest:location-selected', { detail: { locationId: id, location: p, source: 'map' } }));
    const marker = markerRefs.current.get(id);
    if (marker && map.current) { const latLng = marker.getLatLng(); map.current.setView(latLng, Math.max(map.current.getZoom(), 16), { animate: true }); marker.openPopup(); }
  };

  const load = async (lat, lng, nextAmenities = selectedAmenityNames) => {
    const id = ++seq.current; setOrigin([lat, lng]); setBusy(true);
    const amenityLabel = nextAmenities.length ? ` · ${nextAmenities.length} amenity filter${nextAmenities.length === 1 ? '' : 's'}` : '';
    setStatus(`Searching amenities within ${radius} mi${amenityLabel}…`);
    try {
      const rows = await services.maps.nearby({ latitude: lat, longitude: lng, radiusKm: radius * KM_PER_MILE, category: 'all', search: search.trim(), amenities: Object.fromEntries(nextAmenities.map(name => [name, true])), discover: true, limit: 500 });
      if (id !== seq.current) return;
      setPlaces(Array.isArray(rows) ? rows : []);
      setSelectedId(current => Array.isArray(rows) && rows.some(p => key(p) === current) ? current : '');
      setStatus(rows?.length ? `${rows.length} places within ${radius} mi${amenityLabel}.` : `No places found within ${radius} mi${amenityLabel}.`);
      try { localStorage.setItem('kleenest.lastLocation', JSON.stringify({ latitude: lat, longitude: lng, savedAt: Date.now() })); } catch {}
    } catch (e) { if (id === seq.current) setStatus(e?.message ? `Unable to refresh nearby places: ${e.message}` : 'Unable to refresh nearby places.'); }
    finally { if (id === seq.current) setBusy(false); }
  };

  const locate = () => {
    if (!navigator.geolocation) { setStatus('GPS is unavailable in this browser.'); return; }
    setBusy(true); setStatus('Getting your current location…');
    navigator.geolocation.getCurrentPosition(({ coords }) => void load(coords.latitude, coords.longitude), () => { const saved = lastLocation(); if (saved) void load(saved[0], saved[1]); else { setBusy(false); setStatus('Location permission was unavailable. Use your browser location setting.'); } }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 });
  };

  const toggleAmenity = id => setAmenities(current => ({ ...current, [id]: !current[id] }));
  const clearAmenities = () => setAmenities({});

  useEffect(() => { if (configured && !loading && user && !origin) locate(); }, [configured, loading, user?.id]);
  useEffect(() => { if (!origin) return; const t = setTimeout(() => void load(origin[0], origin[1], selectedAmenityNames), 350); return () => clearTimeout(t); }, [radius, search, JSON.stringify(selectedAmenityNames)]);

  useLayoutEffect(() => {
    const el = node.current; if (!el) return; let cancelled = false, retryTimer = 0, cleanup = null;
    const start = () => {
      if (cancelled || map.current) return;
      const rect = el.getBoundingClientRect(); if (rect.width < 20 || rect.height < 20) { retryTimer = window.setTimeout(start, 100); return; }
      try {
        el.replaceChildren(); const initial = origin || lastLocation() || DEFAULT_CENTER; const initialZoom = origin || lastLocation() ? 13 : 12;
        const mapInstance = L.map(el, { zoomControl: true, preferCanvas: true, zoomAnimation: true, fadeAnimation: true, attributionControl: true }).setView(initial, initialZoom);
        const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, maxNativeZoom: 19, subdomains: ['a', 'b', 'c'], attribution: '&copy; OpenStreetMap contributors' });
        tiles.on('tileerror', () => { if (!cancelled) { setMapError('Map tiles are unavailable right now. Retrying…'); window.setTimeout(() => mapInstance.invalidateSize({ pan: false }), 250); } });
        tiles.on('load', () => { if (!cancelled) setMapError(''); }); tiles.addTo(mapInstance); layer.current = L.layerGroup().addTo(mapInstance); map.current = mapInstance; setMapReady(true);
        const recover = () => window.requestAnimationFrame(() => mapInstance.invalidateSize({ pan: false }));
        const ro = 'ResizeObserver' in window ? new ResizeObserver(recover) : null; if (ro) ro.observe(el); window.addEventListener('resize', recover); window.addEventListener('pageshow', recover); window.addEventListener('orientationchange', recover); window.addEventListener('visibilitychange', recover); recover(); window.setTimeout(recover, 100); window.setTimeout(recover, 400);
        cleanup = () => { ro?.disconnect(); window.removeEventListener('resize', recover); window.removeEventListener('pageshow', recover); window.removeEventListener('orientationchange', recover); window.removeEventListener('visibilitychange', recover); setMapReady(false); markerRefs.current.clear(); layer.current = null; if (map.current === mapInstance) map.current = null; mapInstance.remove(); };
      } catch (e) { setMapReady(false); setMapError(e?.message || 'Map initialization failed; retrying.'); retryTimer = window.setTimeout(start, 500); }
    };
    start(); return () => { cancelled = true; window.clearTimeout(retryTimer); cleanup?.(); };
  }, []);

  useEffect(() => {
    const m = map.current, l = layer.current; if (!m || !l || !mapReady) return; l.clearLayers(); markerRefs.current.clear();
    if (origin) L.circleMarker(origin, { radius: 8, color: '#111827', fillColor: '#fff', fillOpacity: 1, weight: 3 }).addTo(l).bindTooltip('You are here');
    const points = [];
    visible.forEach((p, i) => {
      if (!Number.isFinite(+p.latitude) || !Number.isFinite(+p.longitude)) return;
      const id = key(p), isSelected = id === selectedId; const marker = L.marker([+p.latitude, +p.longitude], { icon: markerIcon(p, { selected: isSelected, favorite: false }), zIndexOffset: isSelected ? 2000 : i }).addTo(l); markerRefs.current.set(id, marker);
      const s = placeStatus(p), b = bathroomIntelligence(p), addr = displayAddress(p), phone = p?.phone || p?.phone_number || '', site = website(p), amenityText = Array.isArray(p?.amenity_labels) ? p.amenity_labels.join(' · ') : '';
      marker.bindPopup(`<div class="map-popup"><div class="popup-identity"><strong>${safeText(label(p))}</strong></div><div class="popup-meta"><span class="popup-category">${safeText(p?.category || 'Location')}</span><span class="popup-source">${safeText(sourceLabel(p))}</span></div><div class="popup-status"><span class="status-pill ${safeText(s.key)}">${safeText(s.glyph)} ${safeText(s.label)}</span>${b.hasSignal ? `<span class="bathroom-pill ${safeText(b.status)}">${safeText(bathroomSignalLabel(p))}</span>` : ''}</div>${amenityText ? `<p class="popup-address"><strong>Amenities:</strong> ${safeText(amenityText)}</p>` : ''}<p class="popup-address">${safeText(addr)}</p>${phone ? `<div class="popup-detail">☎ ${safeText(phone)}</div>` : ''}${site ? `<div class="popup-detail">${safeText(site)}</div>` : ''}<div class="popup-detail">${Number.isFinite(+p.distance_miles) ? `${Number(p.distance_miles).toFixed(1)} mi away` : 'Nearby location'}</div></div>`, { maxWidth: 340 });
      marker.on('click', () => selectPlace(p)); points.push([+p.latitude, +p.longitude]);
    });
    if (points.length > 1 && !selectedId) m.fitBounds(L.latLngBounds(points), { padding: [45, 45], maxZoom: 16 }); else if (points.length === 1 && !selectedId) m.setView(points[0], 16); else if (!points.length && origin) m.setView(origin, radius >= 25 ? 10 : 14); m.invalidateSize({ pan: false });
  }, [visible, origin, radius, selectedId, mapReady]);

  const statusCounts = useMemo(() => { const x = { verified: 0, open: 0, premium: 0, reported: 0, unknown: 0, bathroom: 0 }; visible.forEach(p => { const s = placeStatus(p).key; x[s] = (x[s] || 0) + 1; if (bathroomIntelligence(p).hasSignal) x.bathroom++; }); return x; }, [visible]);

  return <WorkspaceShell><section className="page map-v3">
    <div className="map-heading"><div><span className="eyebrow">LOCATION INTELLIGENCE</span><h1>Find places by amenity.</h1><p>Search the map for the amenities you need. Location type is no longer the primary filter; each result can carry its own verified or OSM/Overpass amenity signals.</p></div><button className="button primary" onClick={locate} disabled={busy}><LocateFixed size={16}/>{busy ? 'Locating…' : 'Use my location'}</button></div>
    <div className="map-toolbar"><label><Search size={16}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search amenities or places…" aria-label="Search amenities or places"/></label><select value={radius} onChange={e => setRadius(+e.target.value)} aria-label="Search radius">{RADII.map(x => <option key={x} value={x}>{x} miles</option>)}</select><button className="button secondary" onClick={() => origin ? void load(origin[0], origin[1]) : locate()} disabled={busy}><RefreshCw size={16}/>Refresh</button><span className="map-status">{status}</span></div>
    <section className="map-amenity-panel" aria-label="Amenity filters" style={{ marginBottom: 14, padding: 14, border: '1px solid rgba(15,23,42,.12)', borderRadius: 16, background: 'rgba(255,255,255,.92)', boxShadow: '0 8px 24px rgba(15,23,42,.07)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}><div><strong style={{ fontSize: 15 }}>Amenities</strong><div style={{ fontSize: 12, opacity: .68, marginTop: 2 }}>Choose one or more. Results must contain all selected amenities.</div></div>{selectedAmenityNames.length > 0 && <button type="button" className="button secondary compact" onClick={clearAmenities}>Clear filters</button>}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{AMENITIES.map(item => { const active = Boolean(amenities[item.id]); return <button key={item.id} type="button" aria-pressed={active} onClick={() => toggleAmenity(item.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, minHeight: 40, padding: '8px 12px', borderRadius: 999, border: active ? '2px solid #111827' : '1px solid rgba(15,23,42,.16)', background: active ? '#111827' : '#fff', color: active ? '#fff' : '#334155', fontWeight: 700, cursor: 'pointer', boxShadow: active ? '0 4px 12px rgba(15,23,42,.18)' : 'none' }}><span aria-hidden="true">{item.icon}</span>{item.label}{active && <Check size={15}/>}</button>; })}</div>
    </section>
    <section className="map-legend-panel"><div><div className="map-legend-title">Map legend</div><div className="map-legend-group"><span><i className="legend-status verified">✓</i>Verified {statusCounts.verified}</span><span><i className="legend-status open">●</i>Open {statusCounts.open}</span><span><i className="legend-status premium">◆</i>Premium {statusCounts.premium}</span><span><i className="legend-status reported">!</i>Reported {statusCounts.reported}</span><span><i className="legend-status unknown">•</i>Location signal {statusCounts.unknown}</span></div></div><div><div className="map-legend-title">Active amenities</div><div className="map-legend-group">{selectedAmenityNames.length ? selectedAmenityNames.map(id => <span key={id}><i className="bathroom-dot confirmed">✓</i>{AMENITIES.find(x => x.id === id)?.label || id}</span>) : <span><i className="bathroom-dot confirmed">•</i>All discovered amenities</span>}</div></div><div className="map-legend-note"><ShieldCheck size={15}/>{selectedPlace ? `${label(selectedPlace)} is selected. Its map icon is highlighted and its details are shown below.` : 'Select a result or tap a map pin to inspect its individual location details.'}</div></section>
    {mapError && <div className="map-error"><MapPin size={16}/>{mapError}</div>}
    <div className="map-grid"><div className="map-canvas leaflet-host" ref={node} aria-label="Kleenest amenity map">{!mapReady && <div className="map-loading"><MapPin size={24}/><strong>Loading live map…</strong><span>The map will keep the amenity results visible while tiles initialize.</span></div>}</div>
      <aside className="map-results">{visible.map(p => { const id = key(p), selected = id === selectedId, b = bathroomIntelligence(p), addr = displayAddress(p), phone = p?.phone || p?.phone_number || '', site = website(p), amenityText = Array.isArray(p?.amenity_labels) ? p.amenity_labels : []; return <article className={`map-card${selected ? ' selected' : ''}`} key={id}><button type="button" className="map-card-select" onClick={() => selectPlace(p)} aria-pressed={selected}><div className="map-card-head"><div className="map-card-identity"><span className="map-card-glyph"><MapPin size={18}/></span><div><strong>{label(p)}</strong>{placeBrand(p) && placeBrand(p) !== label(p) && <span className="map-brand">{placeBrand(p)}</span>}</div></div><span className={`status-pill ${safeText(placeStatus(p).key)}`}>{safeText(placeStatus(p).label)}</span></div><div className="map-card-address">{addr}</div>{amenityText.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 7 }}>{amenityText.map(a => <span key={a} style={{ fontSize: 11, fontWeight: 700, padding: '4px 7px', borderRadius: 999, background: '#eef2ff', color: '#334155' }}>{a.replaceAll('_', ' ')}</span>)}</div>}<div className="map-card-meta">{p.city && <span>{p.city}{p.state ? `, ${p.state}` : ''}</span>}{Number.isFinite(+p.distance_miles) && <span>{Number(p.distance_miles).toFixed(1)} mi</span>}{b.hasSignal && <span className={`bathroom-pill ${safeText(b.status)}`}>{safeText(bathroomSignalLabel(p))}</span>}</div></button>{selected && <div className="map-card-details"><div className="detail-row"><MapPin size={15}/><span>{addr}</span></div>{phone && <div className="detail-row"><Phone size={15}/><a href={`tel:${encodeURIComponent(phone)}`}>{phone}</a></div>}{site && <div className="detail-row"><Globe2 size={15}/><span>{site}</span></div>}<div className="detail-row"><Navigation size={15}/><span>{sourceLabel(p)}</span></div><div className="map-card-actions"><Link className="button secondary compact" to={`/place/${encodeURIComponent(id)}`}><ExternalLink size={15}/>View details</Link><Link className="button primary compact" to={`/route?locationId=${encodeURIComponent(id)}`}><RouteIcon size={15}/>Add to route</Link></div></div>}</article>; })}{!visible.length && !busy && <div className="map-empty"><h3>No matching places</h3><p>Try removing an amenity filter, increasing the radius, or changing the search text.</p></div>}</aside>
    </div>
    {selectedPlace && <section className="map-selected-panel"><div><span className="eyebrow">SELECTED LOCATION</span><h2>{label(selectedPlace)}</h2><p>{displayAddress(selectedPlace)}</p><div className="map-selected-facts">{Array.isArray(selectedPlace.amenity_labels) && selectedPlace.amenity_labels.map(a => <span key={a}>{a}</span>)}{Number.isFinite(+selectedPlace.distance_miles) && <span>{Number(selectedPlace.distance_miles).toFixed(1)} mi away</span>}<span>{sourceLabel(selectedPlace)}</span>{bathroomIntelligence(selectedPlace).hasSignal && <span>{bathroomSignalLabel(selectedPlace)}</span>}</div></div><div className="map-selected-actions"><Link className="button secondary" to={`/place/${encodeURIComponent(key(selectedPlace))}`}><ExternalLink size={16}/>Open full details</Link><Link className="button primary" to={`/route?locationId=${encodeURIComponent(key(selectedPlace))}`}><RouteIcon size={16}/>Add to route</Link></div></section>}
  </section></WorkspaceShell>;
}
