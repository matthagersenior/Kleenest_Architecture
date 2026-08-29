import maplibregl from 'maplibre-gl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Building2, LocateFixed, MapPin, Navigation, RefreshCw, Search, ShieldCheck, X, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../AppContext.jsx';
import { bathroomIntelligence, bathroomSignalLabel, placeStatus, safeText } from './MapMarkerSystem.jsx';
import { amenityLabels, placeAddress, placeBrand, placeLogoCandidates, placeName, sourceLabel } from './osmPlaceData.js';
import WorkspaceShell from './WorkspaceShell.jsx';
import './MapSurfaceV3.css';
import './MapSurfaceProductionFixed.css';
import 'maplibre-gl/dist/maplibre-gl.css';

const RADII = [1,2,5,10,25,50];
const DEFAULT_CENTER = [38.627,-90.199];
const OSM_RASTER = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const savedCenter = () => { try { const x=JSON.parse(localStorage.getItem('kleenest.lastLocation')||'null'); return Number.isFinite(+x?.latitude)&&Number.isFinite(+x?.longitude)?[+x.latitude,+x.longitude]:null; } catch { return null; } };
const idOf = p => String(p?.location_id||p?.id||'');
const esc = v => safeText(v);

function markerElement(place, selected) {
  const status=placeStatus(place), logo=placeLogoCandidates(place)[0], initial=esc((placeBrand(place)||placeName(place)).slice(0,1).toUpperCase()||'K');
  const el=document.createElement('div');
  el.className=`kleenest-maplibre-marker ${status.key}${selected?' selected':''}`;
  el.setAttribute('aria-label',placeName(place));
  el.innerHTML=`<span class="kleenest-maplibre-marker-logo">${logo?`<img src="${esc(logo)}" alt="" referrerpolicy="no-referrer">`:''}<span class="kleenest-maplibre-marker-fallback"${logo?' style="display:none"':''}>${initial}</span></span><span class="kleenest-maplibre-marker-status">${esc(status.glyph)}</span>`;
  const img=el.querySelector('img');
  if(img)img.addEventListener('error',()=>{img.remove();const fallback=el.querySelector('.kleenest-maplibre-marker-fallback');if(fallback)fallback.style.display='grid';},{once:true});
  return el;
}

export default function MapSurfaceProductionFixed() {
  const {services,user,configured,loading}=useAppContext();
  const mapHost=useRef(null), mapRef=useRef(null), markerRefs=useRef(new Map()), requestRef=useRef(0);
  const [center,setCenter]=useState(()=>savedCenter()||DEFAULT_CENTER),[places,setPlaces]=useState([]),[radius,setRadius]=useState(2),[search,setSearch]=useState(''),[amenities,setAmenities]=useState([]),[ready,setReady]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[selected,setSelected]=useState(null);
  const visible=useMemo(()=>places.filter(p=>{const q=search.trim().toLowerCase();if(q&&!`${placeName(p)} ${placeBrand(p)} ${placeAddress(p)} ${amenityLabels(p).join(' ')}`.toLowerCase().includes(q))return false;if(amenities.length){const have=new Set(amenityLabels(p).map(x=>String(x).toLowerCase().replace(/[^a-z0-9]+/g,'_')));if(!amenities.every(x=>have.has(x)))return false;}return true;}),[places,search,amenities]);

  const load=async(coords=center)=>{if(!services?.maps?.nearby)return;const token=++requestRef.current;setBusy(true);setError('');try{const rows=await services.maps.nearby({latitude:coords[0],longitude:coords[1],radiusKm:radius*1.609344,category:'all',search:search.trim(),amenities:Object.fromEntries(amenities.map(x=>[x,true])),discover:true,limit:500});if(token!==requestRef.current)return;setPlaces(Array.isArray(rows)?rows:[]);setCenter(coords);try{localStorage.setItem('kleenest.lastLocation',JSON.stringify({latitude:coords[0],longitude:coords[1],savedAt:Date.now()}));}catch{}}catch(e){if(token===requestRef.current)setError(e?.message||'Nearby places could not be loaded.');}finally{if(token===requestRef.current)setBusy(false);}};
  const locate=()=>{if(!navigator.geolocation)return void load(savedCenter()||DEFAULT_CENTER);setBusy(true);navigator.geolocation.getCurrentPosition(p=>void load([p.coords.latitude,p.coords.longitude]),()=>void load(savedCenter()||DEFAULT_CENTER),{enableHighAccuracy:true,timeout:10000,maximumAge:30000});};
  useEffect(()=>{if(configured&&!loading)void load(center);},[configured,loading,user?.id]);
  useEffect(()=>{const t=setTimeout(()=>void load(center),350);return()=>clearTimeout(t);},[radius,amenities.join('|')]);

  useEffect(()=>{
    const el=mapHost.current;if(!el)return;let disposed=false,resizeObserver;
    const recover=()=>{if(!mapRef.current||disposed)return;requestAnimationFrame(()=>mapRef.current?.resize());};
    const init=()=>{if(disposed||mapRef.current)return;const r=el.getBoundingClientRect();if(r.width<40||r.height<40){requestAnimationFrame(init);return;}try{
      const map=new maplibregl.Map({container:el,style:{version:8,sources:{osm:{type:'raster',tiles:[OSM_RASTER],tileSize:256,attribution:'© OpenStreetMap contributors'}},layers:[{id:'osm',type:'raster',source:'osm'}]},center:[center[1],center[0]],zoom:center?13:12,attributionControl:true,renderWorldCopies:false,dragRotate:false,touchPitch:false});
      map.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-left');
      map.on('load',()=>{if(disposed)return;setReady(true);recover();});
      map.on('error',e=>{if(!disposed&&e?.error?.message)setError(`Map error: ${e.error.message}`);});
      mapRef.current=map;
      resizeObserver='ResizeObserver' in window?new ResizeObserver(recover):null;resizeObserver?.observe(el);window.addEventListener('resize',recover,{passive:true});window.addEventListener('orientationchange',recover,{passive:true});window.addEventListener('pageshow',recover);
    }catch(e){setReady(false);setError(e?.message||'Map initialization failed. Retrying…');setTimeout(init,500);}};
    requestAnimationFrame(init);
    return()=>{disposed=true;resizeObserver?.disconnect();window.removeEventListener('resize',recover);window.removeEventListener('orientationchange',recover);window.removeEventListener('pageshow',recover);for(const marker of markerRefs.current.values())marker.remove();markerRefs.current.clear();mapRef.current?.remove();mapRef.current=null;setReady(false);};
  },[]);

  useEffect(()=>{const map=mapRef.current;if(!map||!ready)return;for(const marker of markerRefs.current.values())marker.remove();markerRefs.current.clear();const points=[];visible.forEach((place,i)=>{const lat=+place.latitude,lng=+place.longitude;if(!Number.isFinite(lat)||!Number.isFinite(lng))return;const id=idOf(place),el=markerElement(place,selected&&idOf(selected)===id);el.style.zIndex=String(i+(selected&&idOf(selected)===id?2000:0));const marker=new maplibregl.Marker({element:el,anchor:'bottom'}).setLngLat([lng,lat]).addTo(map);marker.getElement().addEventListener('click',()=>{setSelected(place);map.easeTo({center:[lng,lat],zoom:Math.max(map.getZoom(),16),duration:350});});markerRefs.current.set(id,marker);points.push([lng,lat]);});if(selected&&Number.isFinite(+selected.latitude)&&Number.isFinite(+selected.longitude))map.easeTo({center:[+selected.longitude,+selected.latitude],zoom:Math.max(map.getZoom(),16),duration:250});else if(points.length>1){const bounds=new maplibregl.LngLatBounds(points[0],points[0]);points.slice(1).forEach(p=>bounds.extend(p));map.fitBounds(bounds,{padding:35,maxZoom:16,duration:250});}else if(points.length===1)map.easeTo({center:points[0],zoom:16,duration:250});else map.easeTo({center:[center[1],center[0]],zoom:radius>=25?10:14,duration:250});},[visible,center,ready,selected,radius]);
  useEffect(()=>{const fn=e=>{if(e.key==='Escape')setSelected(null);};window.addEventListener('keydown',fn);return()=>window.removeEventListener('keydown',fn);},[]);
  const clearSelection=()=>setSelected(null);

  return <WorkspaceShell><section className="page map-v3 map-fixed-page">
    <div className="map-heading"><div><span className="eyebrow">LOCATION INTELLIGENCE</span><h1>Find places by amenity.</h1><p>Business identity, OSM address metadata, amenities and source evidence stay together.</p></div><button className="button primary" onClick={locate} disabled={busy}><LocateFixed size={16}/>{busy?'Locating…':'Use my location'}</button></div>
    <div className="map-toolbar"><label><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search businesses, places, or amenities…"/></label><select value={radius} onChange={e=>setRadius(+e.target.value)} aria-label="Search radius">{RADII.map(x=><option key={x} value={x}>{x} miles</option>)}</select><button className="button secondary" onClick={()=>void load(center)} disabled={busy}><RefreshCw size={16}/>Refresh</button><span className="map-status">{busy?'Refreshing nearby places…':`${visible.length} visible places`}</span></div>
    <div className="amenity-picker"><div className="amenity-picker-head"><strong>Quick filters</strong>{amenities.length>0&&<button type="button" className="amenity-clear" onClick={()=>setAmenities([])}>Clear all</button>}</div><div className="amenity-buttons">{[['restroom','Restroom'],['accessible_restroom','Accessible restroom'],['wheelchair','Wheelchair'],['drinking_water','Drinking water'],['baby_changing','Baby changing'],['shower','Shower'],['handwashing','Handwashing'],['parking','Parking'],['ev_charging','EV charging'],['wifi','Wi-Fi'],['atm','ATM']].map(([id,label])=><button type="button" key={id} className={amenities.includes(id)?'is-selected':''} onClick={()=>setAmenities(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id])} aria-pressed={amenities.includes(id)}>{label}</button>)}</div></div>
    {error&&<div className="map-error" role="alert"><ShieldCheck size={16}/>{error}</div>}
    <div className="map-fixed-canvas" aria-label="Live Kleenest map"><div ref={mapHost} className="maplibre-host" aria-label="Map"></div>{!ready&&<div className="map-loading"><MapPin size={34}/><strong>Starting live map…</strong><span>The map initializes independently of result loading.</span></div>}{selected&&<div className="map-fixed-selection"><button className="map-fixed-close" type="button" onClick={clearSelection} aria-label="Close selected place"><X size={17}/></button><div className="map-fixed-selection-head"><span className="map-fixed-logo"><LogoImage place={selected}/></span><div><strong>{placeName(selected)}</strong><span>{placeBrand(selected)||'Business / location'}</span></div></div><div className="map-fixed-selection-address"><MapPin size={14}/>{placeAddress(selected)}</div><div className="map-fixed-selection-actions"><button className="button secondary compact" onClick={clearSelection}>Close</button><Link className="button secondary compact" to={`/locations/${encodeURIComponent(idOf(selected))}`}><ExternalLink size={14}/>Details</Link><Link className="button primary compact" to={`/route?locationId=${encodeURIComponent(idOf(selected))}`}><Navigation size={14}/>Add to route</Link></div></div>}</div>
    <section className="map-legend-panel"><div><div className="map-legend-title">MAP LEGEND</div><div className="map-legend-group"><span><i className="legend-status verified">✓</i>Verified</span><span><i className="legend-status open">•</i>Open</span><span><i className="legend-status premium">◆</i>Featured</span><span><i className="legend-status reported">!</i>Reported</span><span><i className="legend-status unknown">?</i>Status unknown</span></div></div><div className="map-legend-note"><ShieldCheck size={17}/>{selected?`${placeName(selected)} is selected. Use Close or press Escape to return to the map.`:'Tap a pin or result to select an individual place.'}</div></section>
    <div className="map-results" aria-label="Search results">{visible.length?visible.map(place=>{const id=idOf(place),status=placeStatus(place),isSelected=selected&&idOf(selected)===id,am=amenityLabels(place),bathroom=bathroomIntelligence(place);return <article className={`map-card ${isSelected?'is-selected':''}`} key={id||`${place.latitude}-${place.longitude}`}><button className="map-card-select" type="button" onClick={()=>{setSelected(place);const marker=markerRefs.current.get(id);if(marker)mapRef.current?.easeTo({center:marker.getLngLat(),zoom:Math.max(mapRef.current.getZoom(),16),duration:350});}}><div className="map-card-head"><div className="map-card-identity"><span className="map-card-glyph"><LogoImage place={place} fallback={<Building2 size={22}/>}/></span><div><strong>{placeName(place)}</strong><span className="map-brand">{placeBrand(place)||'Business / location'}</span></div></div><span className={`status-pill ${safeText(status.key)}`}>{safeText(status.glyph)} {safeText(status.label)}</span></div><div className="map-card-address">{placeAddress(place)}</div>{am.length>0&&<div className="map-card-meta">{am.slice(0,8).map(x=><span key={x}>{x}</span>)}</div>}{bathroom.hasSignal&&<div className="map-card-meta"><span>{bathroomSignalLabel(place)}</span></div>}<div className="map-card-meta"><span>{sourceLabel(place)}</span></div></button>{isSelected&&<div className="map-card-actions"><button type="button" className="button secondary compact" onClick={clearSelection}><X size={14}/>Close</button><Link className="button secondary compact" to={`/locations/${encodeURIComponent(id)}`}><ExternalLink size={14}/>Details</Link><Link className="button primary compact" to={`/route?locationId=${encodeURIComponent(id)}`}><Navigation size={14}/>Add to route</Link></div>}</article>;}) : <div className="map-empty"><h3>No matching places</h3><p>Try a wider radius or remove an amenity filter.</p></div>}</div>
  </section></WorkspaceShell>;
}

function LogoImage({place,fallback=null}) { const [index,setIndex]=useState(0); const candidates=placeLogoCandidates(place); if(!candidates[index])return fallback||<span className="map-logo-initial">{(placeBrand(place)||placeName(place)).slice(0,1).toUpperCase()}</span>; return <img src={candidates[index]} alt="" loading="lazy" referrerPolicy="no-referrer" onError={()=>setIndex(v=>v+1)}/>; }
