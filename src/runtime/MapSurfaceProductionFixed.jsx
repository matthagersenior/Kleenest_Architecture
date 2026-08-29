import L from 'leaflet';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Building2, LocateFixed, MapPin, RefreshCw, Search, ShieldCheck, X, Navigation, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext.jsx';
import WorkspaceShell from './WorkspaceShell.jsx';
import { bathroomIntelligence, bathroomSignalLabel, placeStatus, safeText } from './MapMarkerSystem.jsx';
import { amenityLabels, placeAddress, placeBrand, placeLogoCandidates, placeName, sourceLabel } from './osmPlaceData.js';
import './MapSurfaceV3.css';
import './MapSurfaceProductionFixed.css';
import 'leaflet/dist/leaflet.css';

const RADII = [1, 2, 5, 10, 25, 50];
const DEFAULT_CENTER = [38.627, -90.199];
const lastLocation = () => { try { const x = JSON.parse(localStorage.getItem('kleenest.lastLocation') || 'null'); return Number.isFinite(+x?.latitude) && Number.isFinite(+x?.longitude) ? [+x.latitude, +x.longitude] : null; } catch { return null; } };
const key = p => String(p?.location_id || p?.id || '');
const esc = v => safeText(v);

function markerIcon(place, selected) {
  const status = placeStatus(place);
  const logo = placeLogoCandidates(place)[0];
  const fallback = esc((placeBrand(place) || placeName(place)).slice(0, 1).toUpperCase() || 'K');
  const image = logo ? `<img src="${esc(logo)}" alt="" referrerpolicy="no-referrer" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">` : '';
  const html = `<div class="kleenest-fixed-marker ${status.key} ${selected ? 'selected' : ''}"><span class="kleenest-fixed-marker-logo">${image}<span class="kleenest-fixed-marker-fallback" style="display:${logo ? 'none' : 'grid'}">${fallback}</span></span><span class="kleenest-fixed-marker-status">${esc(status.glyph)}</span></div>`;
  return L.divIcon({ className: 'kleenest-fixed-marker-wrapper', html, iconSize: [54, 54], iconAnchor: [27, 48], popupAnchor: [0, -44] });
}

export default function MapSurfaceProductionFixed() {
  const { services, user, configured, loading } = useAppContext();
  const navigate = useNavigate();
  const node = useRef(null), mapRef = useRef(null), layerRef = useRef(null), markers = useRef(new Map()), generation = useRef(0);
  const [origin, setOrigin] = useState(() => lastLocation() || DEFAULT_CENTER);
  const [places, setPlaces] = useState([]), [radius, setRadius] = useState(2), [search, setSearch] = useState(''), [amenities, setAmenities] = useState([]);
  const [busy, setBusy] = useState(false), [ready, setReady] = useState(false), [mapError, setMapError] = useState(''), [dataError, setDataError] = useState(''), [selected, setSelected] = useState(null);
  const visible = useMemo(() => places.filter(p => {
    const q = search.trim().toLowerCase();
    if (q && !`${placeName(p)} ${placeBrand(p)} ${placeAddress(p)} ${amenityLabels(p).join(' ')}`.toLowerCase().includes(q)) return false;
    if (amenities.length) { const have = new Set(amenityLabels(p).map(x => String(x).toLowerCase().replace(/[^a-z0-9]+/g, '_'))); if (!amenities.every(a => have.has(a))) return false; }
    return true;
  }), [places, search, amenities]);

  const load = async (coords = origin) => {
    if (!services?.maps?.nearby || !coords) return;
    const request = ++generation.current; setBusy(true); setDataError('');
    try {
      const filter = Object.fromEntries(amenities.map(a => [a, true]));
      const rows = await services.maps.nearby({ latitude: coords[0], longitude: coords[1], radiusKm: radius * 1.609344, category: 'all', search: search.trim(), amenities: filter, discover: true, limit: 500 });
      if (request !== generation.current) return;
      setPlaces(Array.isArray(rows) ? rows : []); setOrigin(coords);
      try { localStorage.setItem('kleenest.lastLocation', JSON.stringify({ latitude: coords[0], longitude: coords[1], savedAt: Date.now() })); } catch {}
    } catch (e) { if (request === generation.current) setDataError(e?.message || 'Nearby places could not be loaded. The live map is still available.'); }
    finally { if (request === generation.current) setBusy(false); }
  };

  const locate = () => {
    if (!navigator.geolocation) { const saved = lastLocation(); void load(saved || DEFAULT_CENTER); return; }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(p => void load([p.coords.latitude, p.coords.longitude]), () => { const saved = lastLocation(); void load(saved || DEFAULT_CENTER); }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 });
  };

  useEffect(() => { if (configured && !loading && services?.maps?.nearby) void load(origin); }, [configured, loading, user?.id]);
  useEffect(() => { if (!origin || !services?.maps?.nearby) return; const t = setTimeout(() => void load(origin), 350); return () => clearTimeout(t); }, [radius, amenities.join('|')]);

  useLayoutEffect(() => {
    const el = node.current; if (!el) return;
    let disposed = false, retry = 0, observer = null, timer = 0;
    const invalidate = () => { const map = mapRef.current; if (!map || disposed) return; requestAnimationFrame(() => map.invalidateSize({ pan: false, animate: false })); };
    const init = () => {
      if (disposed || mapRef.current) return;
      const rect = el.getBoundingClientRect();
      if (rect.width < 40 || rect.height < 40) { retry = window.setTimeout(init, 100); return; }
      try {
        if (el._leaflet_id) { try { L.DomUtil.get(el)._leaflet_id = null; } catch {} }
        el.replaceChildren();
        const map = L.map(el, { zoomControl: true, attributionControl: true, preferCanvas: true, fadeAnimation: false, zoomAnimation: false, markerZoomAnimation: false, trackResize: true }).setView(origin || DEFAULT_CENTER, origin ? 13 : 12);
        const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, maxNativeZoom: 19, updateWhenIdle: false, keepBuffer: 2, attribution: '&copy; OpenStreetMap contributors' });
        tiles.on('tileerror', () => setMapError('Map tiles are temporarily unavailable.'));
        tiles.on('load', () => setMapError(''));
        tiles.addTo(map);
        layerRef.current = L.layerGroup().addTo(map); mapRef.current = map; setReady(true); setMapError('');
        const recover = () => { if (document.visibilityState === 'hidden') return; invalidate(); window.clearTimeout(timer); timer = window.setTimeout(invalidate, 180); };
        observer = 'ResizeObserver' in window ? new ResizeObserver(recover) : null; observer?.observe(el);
        window.addEventListener('resize', recover, { passive: true }); window.addEventListener('orientationchange', recover, { passive: true }); window.addEventListener('pageshow', recover); document.addEventListener('visibilitychange', recover);
        recover();
        el._kleenestMapCleanup = () => { observer?.disconnect(); window.removeEventListener('resize', recover); window.removeEventListener('orientationchange', recover); window.removeEventListener('pageshow', recover); document.removeEventListener('visibilitychange', recover); window.clearTimeout(timer); if (mapRef.current === map) { map.off(); map.remove(); } mapRef.current = null; layerRef.current = null; markers.current.clear(); setReady(false); };
      } catch (e) { setReady(false); setMapError(e?.message || 'Map initialization failed. Retrying…'); retry = window.setTimeout(init, 500); }
    };
    requestAnimationFrame(init);
    return () => { disposed = true; window.clearTimeout(retry); el._kleenestMapCleanup?.(); delete el._kleenestMapCleanup; };
  }, []);

  useEffect(() => {
    const map = mapRef.current, layer = layerRef.current; if (!map || !layer || !ready) return;
    layer.clearLayers(); markers.current.clear();
    if (origin) L.circleMarker(origin, { radius: 8, color: '#111827', fillColor: '#fff', fillOpacity: 1, weight: 3 }).addTo(layer).bindTooltip('You are here');
    const points = [];
    visible.forEach((place, index) => {
      const lat = Number(place.latitude), lng = Number(place.longitude); if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      const id = key(place), marker = L.marker([lat, lng], { icon: markerIcon(place, selected && key(selected) === id), zIndexOffset: index + (selected && key(selected) === id ? 2000 : 0) }).addTo(layer);
      markers.current.set(id, marker);
      marker.on('click', () => { setSelected(place); map.setView([lat, lng], Math.max(map.getZoom(), 16), { animate: true }); });
      points.push([lat, lng]);
    });
    if (selected && Number.isFinite(+selected.latitude) && Number.isFinite(+selected.longitude)) map.setView([+selected.latitude, +selected.longitude], Math.max(map.getZoom(), 16), { animate: true });
    else if (points.length > 1) map.fitBounds(L.latLngBounds(points), { padding: [35, 35], maxZoom: 16 });
    else if (points.length === 1) map.setView(points[0], 16);
    else map.setView(origin || DEFAULT_CENTER, radius >= 25 ? 10 : 14);
    requestAnimationFrame(() => map.invalidateSize({ pan: false, animate: false }));
  }, [visible, origin, radius, ready, selected]);

  useEffect(() => { const onKey = e => { if (e.key === 'Escape') setSelected(null); }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }, []);
  const clearSelection = () => { setSelected(null); mapRef.current?.closePopup?.(); };

  return <WorkspaceShell><section className="page map-v3 map-fixed-page">
    <div className="map-heading"><div><span className="eyebrow">LOCATION INTELLIGENCE</span><h1>Find places by amenity.</h1><p>Every result keeps its business identity, OSM address metadata, amenities and source evidence together.</p></div><button className="button primary" onClick={locate} disabled={busy}><LocateFixed size={16}/>{busy ? 'Locating…' : 'Use my location'}</button></div>
    <div className="map-toolbar"><label><Search size={16}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search businesses, places, or amenities…" aria-label="Search businesses, places, or amenities"/></label><select value={radius} onChange={e => setRadius(+e.target.value)} aria-label="Search radius">{RADII.map(x => <option key={x} value={x}>{x} miles</option>)}</select><button className="button secondary" onClick={() => void load(origin)} disabled={busy}><RefreshCw size={16}/>Refresh</button><span className="map-status">{busy ? 'Refreshing nearby places…' : `${visible.length} visible places`}</span></div>
    <div className="amenity-picker"><div className="amenity-picker-head"><strong>Quick filters</strong>{amenities.length > 0 && <button type="button" className="amenity-clear" onClick={() => setAmenities([])}>Clear all</button>}</div><div className="amenity-buttons">{[['restroom','Restroom'],['accessible_restroom','Accessible restroom'],['wheelchair','Wheelchair'],['drinking_water','Drinking water'],['baby_changing','Baby changing'],['shower','Shower'],['handwashing','Handwashing'],['parking','Parking'],['ev_charging','EV charging'],['wifi','Wi-Fi'],['atm','ATM']].map(([id,label]) => <button type="button" key={id} className={amenities.includes(id) ? 'is-selected' : ''} onClick={() => setAmenities(v => v.includes(id) ? v.filter(x => x !== id) : [...v, id]} aria-pressed={amenities.includes(id)}>{label}</button>)}</div></div>
    {mapError && <div className="map-error" role="alert"><MapPin size={16}/>{mapError}</div>}{dataError && <div className="map-error" role="status"><ShieldCheck size={16}/>{dataError}</div>}
    <div className="map-fixed-canvas" ref={node} aria-label="Live Kleenest map">{!ready && <div className="map-loading"><MapPin size={34}/><strong>Starting live map…</strong><span>The map is initializing independently of result loading.</span></div>}{selected && <div className="map-fixed-selection"><button className="map-fixed-close" type="button" onClick={clearSelection} aria-label="Close selected place"><X size={17}/></button><div className="map-fixed-selection-head"><span className="map-fixed-logo"><LogoImage place={selected}/></span><div><strong>{placeName(selected)}</strong><span>{placeBrand(selected) || 'Business / location'}</span></div></div><div className="map-fixed-selection-address"><MapPin size={14}/>{placeAddress(selected)}</div><div className="map-fixed-selection-actions"><button className="button secondary compact" onClick={clearSelection}>Close</button><Link className="button secondary compact" to={`/locations/${encodeURIComponent(key(selected))}`}><ExternalLink size={14}/>Details</Link><Link className="button primary compact" to={`/route?locationId=${encodeURIComponent(key(selected))}`}><Navigation size={14}/>Add to route</Link></div></div>}</div>
    <section className="map-legend-panel"><div><div className="map-legend-title">MAP LEGEND</div><div className="map-legend-group"><span><i className="legend-status verified">✓</i>Verified</span><span><i className="legend-status open">•</i>Open</span><span><i className="legend-status premium">◆</i>Featured</span><span><i className="legend-status reported">!</i>Reported</span><span><i className="legend-status unknown">?</i>Status unknown</span></div></div><div className="map-legend-note"><ShieldCheck size={17}/>{selected ? `${placeName(selected)} is selected. Use Close or press Escape to return to the unselected map.` : 'Tap a business pin or result to select the individual place.'}</div></section>
    <div className="map-results" aria-label="Search results">{visible.length ? visible.map(place => { const id = key(place), status = placeStatus(place), selectedRow = selected && key(selected) === id, amenitiesForPlace = amenityLabels(place), bathroom = bathroomIntelligence(place); return <article className={`map-card ${selectedRow ? 'is-selected' : ''}`} key={id || `${place.latitude}-${place.longitude}`}><button className="map-card-select" type="button" onClick={() => { setSelected(place); const marker = markers.current.get(id); if (marker && mapRef.current) mapRef.current.setView(marker.getLatLng(), Math.max(mapRef.current.getZoom(), 16), { animate: true }); }}><div className="map-card-head"><div className="map-card-identity"><span className="map-card-glyph"><LogoImage place={place} fallback={<Building2 size={22}/>}/></span><div><strong>{placeName(place)}</strong><span className="map-brand">{placeBrand(place) || 'Business / location'}</span></div></div><span className={`status-pill ${safeText(status.key)}`}>{safeText(status.glyph)} {safeText(status.label)}</span></div><div className="map-card-address">{placeAddress(place)}</div>{amenitiesForPlace.length > 0 && <div className="map-card-meta">{amenitiesForPlace.slice(0, 8).map(x => <span key={x}>{x}</span>)}</div>}{bathroom.hasSignal && <div className="map-card-meta"><span>{bathroomSignalLabel(place)}</span></div>}<div className="map-card-meta"><span>{sourceLabel(place)}</span>{Number.isFinite(+place.distance_miles) && <span>{Number(place.distance_miles).toFixed(1)} mi</span>}</div></button>{selectedRow && <div className="map-card-actions"><button type="button" className="button secondary compact" onClick={clearSelection}><X size={14}/>Close</button><Link className="button secondary compact" to={`/locations/${encodeURIComponent(id)}`}><ExternalLink size={14}/>Details</Link><Link className="button primary compact" to={`/route?locationId=${encodeURIComponent(id)}`}><Navigation size={14}/>Add to route</Link></div>}</article>; }) : <div className="map-empty"><h3>No matching places</h3><p>Try a wider radius or remove an amenity filter.</p></div>}</div>
  </section></WorkspaceShell>;
}

function LogoImage({ place, fallback = null }) {
  const [index, setIndex] = useState(0); const candidates = placeLogoCandidates(place);
  if (!candidates[index]) return fallback || <span className="map-logo-initial">{(placeBrand(place) || placeName(place)).slice(0,1).toUpperCase()}</span>;
  return <img src={candidates[index]} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setIndex(v => v + 1)} />;
}
