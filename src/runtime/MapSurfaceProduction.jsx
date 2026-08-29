import L from 'leaflet';
import {useEffect,useMemo,useRef,useState} from 'react';
import {Building2,LocateFixed,MapPin,RefreshCw,Search,ShieldCheck,Trophy} from 'lucide-react';
import {Link} from 'react-router-dom';
import {useAppContext} from '../AppContext.jsx';
import WorkspaceShell from './WorkspaceShell.jsx';
import {markerIcon,placeStatus,bathroomIntelligence,bathroomSignalLabel,safeText} from './MapMarkerSystem.jsx';
import 'leaflet/dist/leaflet.css';
import './MapSurfaceV3.css';

const RADII=[1,2,5,10,25,50];
const AMENITIES=['restroom','accessible_restroom','wheelchair','drinking_water','baby_changing','shower','handwashing','seating','parking','ev_charging','wifi','atm'];
const DEFAULT_CENTER=[38.627,-90.199];
const key=p=>String(p?.location_id||p?.id||'');
const name=p=>p?.name||p?.brand||p?.operator_name||'Kleenest location';
const address=p=>p?.address||p?.formatted_address||[p?.street_number,p?.street,p?.city,p?.state,p?.postal_code].filter(Boolean).join(', ')||[p?.city,p?.state,p?.postal_code].filter(Boolean).join(', ')||'Address not yet available';
const logo=p=>p?.logo_url||p?.logo||p?.brand_logo_url||p?.image_url||p?.image||'';
const amenityList=p=>Array.isArray(p?.amenity_labels)?p.amenity_labels:(Array.isArray(p?.amenities)?p.amenities.map(x=>typeof x==='string'?x:x?.label||x?.name).filter(Boolean):[]);
const lastLocation=()=>{try{const x=JSON.parse(localStorage.getItem('kleenest.lastLocation')||'null');return Number.isFinite(+x?.latitude)&&Number.isFinite(+x?.longitude)?[+x.latitude,+x.longitude]:null;}catch{return null;}};

export default function MapSurfaceProduction(){
 const{services,user,configured,loading}=useAppContext();
 const node=useRef(null),mapRef=useRef(null),layerRef=useRef(null),markers=useRef(new Map());
 const[origin,setOrigin]=useState(lastLocation),[places,setPlaces]=useState([]),[radius,setRadius]=useState(2),[search,setSearch]=useState(''),[amenity,setAmenity]=useState(''),[busy,setBusy]=useState(false),[ready,setReady]=useState(false),[error,setError]=useState('');
 const visible=useMemo(()=>places.filter(p=>{const q=search.trim().toLowerCase();if(q&&!`${name(p)} ${p?.brand||''} ${address(p)} ${amenityList(p).join(' ')}`.toLowerCase().includes(q))return false;if(amenity&&!amenityList(p).some(x=>String(x).toLowerCase().replaceAll(' ','_').includes(amenity)))return false;return true;}),[places,search,amenity]);
 const load=async(coords=origin)=>{if(!coords)return;setBusy(true);setError('');try{const rows=await services.maps.nearby({latitude:coords[0],longitude:coords[1],radiusKm:radius*1.609344,category:'all',search:search.trim(),amenities:amenity?{[amenity]:true}:{},discover:true,limit:500});setPlaces(Array.isArray(rows)?rows:[]);setOrigin(coords);try{localStorage.setItem('kleenest.lastLocation',JSON.stringify({latitude:coords[0],longitude:coords[1],savedAt:Date.now()}));}catch{}}catch(e){setError(e?.message||'Unable to load nearby places.')}finally{setBusy(false)}};
 const locate=()=>{if(!navigator.geolocation){setError('GPS is unavailable in this browser.');return;}setBusy(true);navigator.geolocation.getCurrentPosition(p=>void load([p.coords.latitude,p.coords.longitude]),()=>{const saved=lastLocation();if(saved)void load(saved);else{setBusy(false);setError('Location permission was unavailable.');}},{enableHighAccuracy:true,timeout:10000,maximumAge:30000});};
 useEffect(()=>{if(configured&&!loading&&user&&!origin)locate();},[configured,loading,user?.id]);
 useEffect(()=>{if(!origin)return;const t=setTimeout(()=>void load(origin),350);return()=>clearTimeout(t);},[radius,amenity]);
 useEffect(()=>{
   const el=node.current;if(!el)return;let disposed=false;let retry;let observer;let refreshTimer;
   const invalidate=()=>{const m=mapRef.current;if(!m||disposed)return;requestAnimationFrame(()=>{if(!disposed&&mapRef.current===m){m.invalidateSize({pan:false,animate:false});}});};
   const scheduleInvalidate=()=>{invalidate();clearTimeout(refreshTimer);refreshTimer=setTimeout(invalidate,120);setTimeout(invalidate,400);setTimeout(invalidate,900);};
   const init=()=>{
     if(disposed||mapRef.current)return;
     const rect=el.getBoundingClientRect();
     if(rect.width<40||rect.height<40||el.offsetParent===null){retry=setTimeout(init,150);return;}
     try{
       if(el._leaflet_id){el.replaceChildren();delete el._leaflet_id;}
       const m=L.map(el,{zoomControl:true,attributionControl:true,preferCanvas:true,fadeAnimation:false}).setView(origin||DEFAULT_CENTER,origin?13:12);
       L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors',updateWhenIdle:false,keepBuffer:2}).addTo(m);
       layerRef.current=L.layerGroup().addTo(m);mapRef.current=m;setReady(true);scheduleInvalidate();
       const onVisibility=()=>{if(document.visibilityState==='visible')scheduleInvalidate();};
       const onPageShow=()=>scheduleInvalidate();
       const onResize=()=>scheduleInvalidate();
       window.addEventListener('resize',onResize,{passive:true});window.addEventListener('orientationchange',onResize,{passive:true});window.addEventListener('pageshow',onPageShow);document.addEventListener('visibilitychange',onVisibility);
       observer='ResizeObserver' in window?new ResizeObserver(scheduleInvalidate):null;observer?.observe(el);
       el._kleenestCleanup=()=>{observer?.disconnect();window.removeEventListener('resize',onResize);window.removeEventListener('orientationchange',onResize);window.removeEventListener('pageshow',onPageShow);document.removeEventListener('visibilitychange',onVisibility);clearTimeout(refreshTimer);if(mapRef.current===m)m.remove();mapRef.current=null;layerRef.current=null;markers.current.clear();setReady(false);};
     }catch(e){setError(e?.message||'Map initialization failed.');retry=setTimeout(init,500);}
   };
   init();return()=>{disposed=true;clearTimeout(retry);el._kleenestCleanup?.();delete el._kleenestCleanup;};
 },[]);
 useEffect(()=>{const m=mapRef.current,l=layerRef.current;if(!m||!l||!ready)return;l.clearLayers();markers.current.clear();if(origin)L.circleMarker(origin,{radius:8,color:'#111827',fillColor:'#fff',fillOpacity:1,weight:3}).addTo(l).bindTooltip('You are here');const pts=[];visible.forEach((p,i)=>{if(!Number.isFinite(+p.latitude)||!Number.isFinite(+p.longitude))return;const id=key(p);const marker=L.marker([+p.latitude,+p.longitude],{icon:markerIcon(p,{selected:false,favorite:false}),zIndexOffset:i}).addTo(l);markers.current.set(id,marker);const s=placeStatus(p),b=bathroomIntelligence(p),a=amenityList(p);marker.bindPopup(`<div class="map-popup"><strong>${safeText(name(p))}</strong><div class="popup-status"><span class="status-pill ${safeText(s.key)}">${safeText(s.glyph)} ${safeText(s.label)}</span>${b.hasSignal?`<span class="bathroom-pill ${safeText(b.status)}">${safeText(bathroomSignalLabel(p))}</span>`:''}</div>${a.length?`<p class="popup-address"><strong>Amenities:</strong> ${safeText(a.join(' · '))}</p>`:''}<p class="popup-address">${safeText(address(p))}</p></div>`);pts.push([+p.latitude,+p.longitude]);});if(pts.length>1)m.fitBounds(L.latLngBounds(pts),{padding:[40,40],maxZoom:16});else if(pts.length===1)m.setView(pts[0],16);else if(origin)m.setView(origin,radius>=25?10:14);requestAnimationFrame(()=>m.invalidateSize({pan:false}));},[visible,origin,radius,ready]);
 return <WorkspaceShell><section className="page map-v3"><div className="map-heading"><div><span className="eyebrow">LOCATION INTELLIGENCE</span><h1>Find places by amenity.</h1><p>Every result is an individual place. Known business identity and amenity signals stay attached to that place instead of being grouped into anonymous map clusters.</p></div><button className="button primary" onClick={locate} disabled={busy}><LocateFixed size={16}/>{busy?'Locating…':'Use my location'}</button></div>
 <div className="map-toolbar"><label><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search businesses, places, or amenities…" aria-label="Search businesses, places, or amenities"/></label><select value={radius} onChange={e=>setRadius(+e.target.value)} aria-label="Search radius">{RADII.map(x=><option key={x} value={x}>{x} miles</option>)}</select><select value={amenity} onChange={e=>setAmenity(e.target.value)} aria-label="Amenity filter"><option value="">All amenities</option>{AMENITIES.map(x=><option key={x} value={x}>{x.replaceAll('_',' ')}</option>)}</select><button className="button secondary" onClick={()=>origin?void load(origin):locate()} disabled={busy}><RefreshCw size={16}/>Refresh</button></div>
 {error&&<div className="map-error" role="alert">{error}</div>}
 <div className="map-canvas" ref={node} aria-label="Live Kleenest map">{!ready&&<div className="map-loading"><MapPin size={34}/><strong>Starting live map…</strong><span>Results remain available below while the map initializes.</span></div>}</div>
 <section className="map-legend-panel" aria-label="Map legend"><div><div className="map-legend-title">MAP LEGEND</div><div className="map-legend-group"><span><i className="legend-status verified">✓</i>Verified</span><span><i className="legend-status open">•</i>Open</span><span><i className="legend-status premium">◆</i>Premium</span><span><i className="legend-status reported">!</i>Reported</span><span><i className="legend-status unknown">?</i>Status unknown</span></div></div><div><div className="map-legend-title">ACTIVE AMENITY</div><div className="map-legend-group"><span><i className="bathroom-dot confirmed">•</i>{amenity?amenity.replaceAll('_',' '):'All discovered amenities'}</span></div></div><div className="map-legend-note"><ShieldCheck size={17}/>Select a result or tap an individual business pin to inspect its location details.</div></section>
 <div className="map-results" aria-label="Search results">{visible.length?visible.map(p=>{const s=placeStatus(p),a=amenityList(p),b=bathroomIntelligence(p),image=logo(p);return <article className="map-card" key={key(p)||`${p.latitude}-${p.longitude}`}><button className="map-card-select" type="button" onClick={()=>{const m=markers.current.get(key(p));if(m){m.openPopup();mapRef.current?.setView(m.getLatLng(),16,{animate:true});}}}><div className="map-card-head"><div className="map-card-identity"><span className="map-card-glyph">{image?<img src={image} alt="" style={{width:36,height:36,objectFit:'contain',borderRadius:8}}/>:<Building2 size={22}/>}</span><div><strong>{name(p)}</strong><span className="map-brand">{p?.brand||p?.operator_name||'Business / location'}</span></div></div><span className={`status-pill ${safeText(s.key)}`}>{safeText(s.glyph)} {safeText(s.label)}</span></div><div className="map-card-address">{address(p)}</div>{a.length>0&&<div className="map-card-meta">{a.slice(0,8).map(x=><span key={x}>{x}</span>)}</div>}{b.hasSignal&&<div className="map-card-meta"><span>{bathroomSignalLabel(p)}</span></div>}</button></article>}) : <div className="map-empty"><h3>No matching places</h3><p>Try a wider radius or remove an amenity filter.</p></div>}
 <div className="map-selected-actions"><Link className="button primary" to="/games"><Trophy size={16}/>Game Center</Link><Link className="button secondary" to="/community"><UsersIcon/>Community</Link></div></div>
 </section></WorkspaceShell>;
}
function UsersIcon(){return <span aria-hidden="true">👥</span>}