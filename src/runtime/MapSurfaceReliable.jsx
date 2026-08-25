import { useEffect,useMemo,useRef,useState } from 'react';
import L from 'leaflet';
import { CheckCircle2,Heart,LocateFixed,Navigation,Search,SlidersHorizontal,Star,Layers3 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import WorkspaceShell from './WorkspaceShell.jsx';
import { useAppContext } from '../AppContext.jsx';
import { MAP_CATEGORIES } from '../domains/maps/network.js';
import { CATEGORY_GLYPHS,clusterPlaces,markerIcon,placeBrand,placeStatus } from './MapMarkerSystem.jsx';
import './MapSurface.css';

const DEFAULT_CENTER=[38.627,-90.199];
const RADII=[2,5,8,15,30,100];
const AMENITIES=['accessible','changing_table','baby_changing','handwashing','drinking_water','shower','parking','ev_charging','wifi','food','outdoor','pet_friendly'];
const AMENITY_LABELS={accessible:'Accessible',changing_table:'Changing table',baby_changing:'Baby/family',handwashing:'Handwashing',drinking_water:'Drinking water',shower:'Showers',parking:'Parking',ev_charging:'EV charging',wifi:'Wi-Fi',food:'Food & drink',outdoor:'Outdoor',pet_friendly:'Pet friendly'};
const keyOf=p=>String(p?.location_id||p?.id||'');
const nameOf=p=>p?.name||p?.brand||p?.operator_name||'Kleenest location';
const normalize=v=>Array.isArray(v)?v.filter(Boolean):Array.isArray(v?.locations)?v.locations.filter(Boolean):Array.isArray(v?.data)?v.data.filter(Boolean):Array.isArray(v?.results)?v.results.filter(Boolean):[];
const amenitiesOf=p=>{const raw=p?.amenities||p?.amenity_names||p?.amenity_labels;if(Array.isArray(raw))return raw.map(v=>String(v).toLowerCase().replaceAll(' ','_'));if(typeof raw==='string')return raw.split(',').map(v=>v.trim().toLowerCase().replaceAll(' ','_')).filter(Boolean);return AMENITIES.filter(k=>p?.[k]===true||p?.[`has_${k}`]===true);};
const distanceOf=p=>{const n=Number(p?.distance_meters??p?.distance??Number(p?.distance_km)*1000);if(!Number.isFinite(n))return '';return n<1000?`${Math.round(n)} m`:`${(n/1000).toFixed(1)} km`;};

const TILE_PROVIDERS=[
 {name:'OpenStreetMap',url:'https://tile.openstreetmap.org/{z}/{x}/{y}.png',options:{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}},
 {name:'CARTO',url:'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',options:{maxZoom:20,subdomains:['a','b','c','d'],attribution:'&copy; OpenStreetMap contributors &copy; CARTO'}},
 {name:'Esri',url:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',options:{maxZoom:19,attribution:'Tiles &copy; Esri'}}
];

export default function MapSurfaceReliable(){
 const navigate=useNavigate();
 const {services,configured,user}=useAppContext();
 const node=useRef(null),mapRef=useRef(null),layerRef=useRef(null),markersRef=useRef(new Map()),tileRef=useRef(null),providerIndex=useRef(0),tileErrors=useRef(0),fallbackTimer=useRef(null);
 const [places,setPlaces]=useState([]),[favorites,setFavorites]=useState(new Set()),[origin,setOrigin]=useState(null),[radius,setRadius]=useState(()=>{try{const n=Number(localStorage.getItem('kleenest.map.radiusKm'));return RADII.includes(n)?n:8;}catch{return 8;}}),[category,setCategory]=useState('all'),[search,setSearch]=useState(''),[amenity,setAmenity]=useState(''),[verified,setVerified]=useState(false),[favoritesOnly,setFavoritesOnly]=useState(false),[busy,setBusy]=useState(false),[status,setStatus]=useState('Finding your location…'),[showLegend,setShowLegend]=useState(true),[mapTileError,setMapTileError]=useState(false),[mapInitError,setMapInitError]=useState('');

 const visible=useMemo(()=>places.filter(p=>{
  if(category!=='all'&&String(p?.category||'')!==category)return false;
  if(amenity&&!amenitiesOf(p).includes(amenity))return false;
  if(verified&&placeStatus(p).key!=='verified')return false;
  if(favoritesOnly&&!favorites.has(keyOf(p)))return false;
  const q=search.trim().toLowerCase();
  if(q&&!`${p?.name||''} ${p?.brand||''} ${p?.operator_name||''} ${p?.address||''} ${p?.city||''} ${p?.state||''} ${p?.category||''} ${amenitiesOf(p).join(' ')}`.toLowerCase().includes(q))return false;
  const d=Number(p?.distance_meters??Number(p?.distance_km)*1000);return !Number.isFinite(d)||d<=radius*1000;
 }),[places,category,amenity,verified,favoritesOnly,favorites,search,radius]);

 const refreshFavorites=async()=>{try{if(!services?.favorites?.list)return;const rows=await services.favorites.list();setFavorites(new Set((Array.isArray(rows)?rows:[]).map(keyOf).filter(Boolean)));}catch{}};
 const activateProvider=()=>{
  const map=mapRef.current;if(!map)return;
  if(fallbackTimer.current)window.clearTimeout(fallbackTimer.current);
  tileErrors.current=0;
  const index=providerIndex.current;
  const provider=TILE_PROVIDERS[index];
  if(tileRef.current){tileRef.current.off();map.removeLayer(tileRef.current);tileRef.current=null;}
  const tiles=L.tileLayer(provider.url,provider.options);
  const fail=()=>{tileErrors.current+=1;if(tileErrors.current>=2&&providerIndex.current<TILE_PROVIDERS.length-1){providerIndex.current+=1;setMapTileError(true);activateProvider();}};
  tiles.on('tileerror',fail);
  tiles.on('load',()=>{tileErrors.current=0;setMapTileError(false);});
  tileRef.current=tiles.addTo(map);
  fallbackTimer.current=window.setTimeout(()=>{if(tileErrors.current===0)return;if(providerIndex.current<TILE_PROVIDERS.length-1){providerIndex.current+=1;setMapTileError(true);activateProvider();}},3500);
 };

 const renderMarkers=()=>{
  const map=mapRef.current,layer=layerRef.current;if(!map||!layer)return;
  layer.clearLayers();markersRef.current.clear();
  clusterPlaces(visible).forEach(item=>{
   const place=item.place,lat=Number(place.latitude),lng=Number(place.longitude);if(!Number.isFinite(lat)||!Number.isFinite(lng))return;
   const id=keyOf(place),favorite=favorites.has(id),marker=L.marker([lat,lng],{icon:markerIcon(place,{selected:false,favorite})}).addTo(layer);markersRef.current.set(id,marker);
   const info=placeStatus(place),brand=placeBrand(place);
   marker.bindPopup(`<div class="map-popup"><div class="popup-identity"><span class="popup-category">${String(CATEGORY_GLYPHS[place.category]||'auto').slice(0,1)}</span><div><strong>${nameOf(place)}</strong>${brand&&brand!==nameOf(place)?`<div class="map-brand">${brand}</div>`:''}</div></div><div class="popup-status"><span class="status-pill ${info.key}">${info.glyph} ${info.label}</span>${distanceOf(place)?`<span>${distanceOf(place)} away</span>`:''}</div><div class="map-popup-actions"><button data-map-action="details">Details</button><button data-map-action="favorite">${favorite?'♥ Remove favorite':'♡ Favorite'}</button><button data-map-action="route">Route</button><button data-map-action="verify">Verify</button></div></div>`);
   marker.on('click',()=>{map.flyTo([lat,lng],17,{duration:.45});});
   marker.on('popupopen',event=>{const root=event.popup.getElement();root?.querySelector('[data-map-action="details"]')?.addEventListener('click',()=>navigate(`/place/${encodeURIComponent(place.id||place.location_id)}`));root?.querySelector('[data-map-action="favorite"]')?.addEventListener('click',()=>void toggleFavorite(place));root?.querySelector('[data-map-action="route"]')?.addEventListener('click',()=>navigate(`/route?origin=${encodeURIComponent(origin?`${origin[0]},${origin[1]}`:'')}&destination=${encodeURIComponent(`${lat},${lng}`)}&locationId=${encodeURIComponent(id)}`));root?.querySelector('[data-map-action="verify"]')?.addEventListener('click',()=>navigate(`/evidence?locationId=${encodeURIComponent(id)}`));});
  });
  if(origin)L.circleMarker(origin,{radius:8,color:'#111827',fillColor:'#fff',fillOpacity:1,weight:3}).addTo(layer).bindTooltip('You are here');
  const points=visible.map(p=>[Number(p.latitude),Number(p.longitude)]).filter(p=>Number.isFinite(p[0])&&Number.isFinite(p[1]));
  if(points.length>1)map.fitBounds(L.latLngBounds(points),{padding:[30,30],maxZoom:15});else if(points.length===1)map.setView(points[0],16);else if(origin)map.setView(origin,radius>=30?10:radius>=15?11:13);
 };

 const loadNearby=async(lat,lng,overrides={})=>{
  const nextRadius=RADII.includes(Number(overrides.radiusKm))?Number(overrides.radiusKm):radius;
  const nextCategory=overrides.category??category;
  const nextSearch=overrides.search??search.trim();
  setOrigin([lat,lng]);setBusy(true);setStatus('Refreshing nearby locations…');
  try{
   const data=normalize(await services.maps.nearby({latitude:lat,longitude:lng,radiusKm:nextRadius,category:nextCategory,search:nextSearch,discover:true,limit:500,userId:user?.id??null}));
   setPlaces(data);setStatus(`${data.length} nearby locations · live discovery refreshed · individual markers enabled.`);
   if(mapRef.current){mapRef.current.setView([lat,lng],nextRadius>=30?10:nextRadius>=15?11:13);window.setTimeout(()=>mapRef.current?.invalidateSize(),50);}
  }catch(error){setPlaces([]);setStatus(error?.message||'Nearby location retrieval failed.');}
  finally{setBusy(false);}
 };
 const locate=()=>{if(!navigator.geolocation){setStatus('GPS is unavailable in this browser.');return;}setBusy(true);setStatus('Getting your current location…');navigator.geolocation.getCurrentPosition(({coords})=>{try{localStorage.setItem('kleenest.lastLocation',JSON.stringify({latitude:coords.latitude,longitude:coords.longitude,accuracy:coords.accuracy||0,savedAt:Date.now()}));}catch{}void loadNearby(coords.latitude,coords.longitude,{radiusKm:radius});},()=>{try{const saved=JSON.parse(localStorage.getItem('kleenest.lastLocation')||'null');if(Number.isFinite(Number(saved?.latitude))&&Number.isFinite(Number(saved?.longitude)))return void loadNearby(Number(saved.latitude),Number(saved.longitude),{radiusKm:radius});}catch{}setBusy(false);setStatus('Location permission was unavailable. Use your browser location setting or search manually.');},{enableHighAccuracy:true,timeout:10000,maximumAge:30000});};
 const toggleFavorite=async place=>{const id=keyOf(place);if(!id)return;try{await services.favorites.toggle(id);await refreshFavorites();}catch(error){setStatus(error?.message||'Unable to update favorite.');}};
 const focusPlace=place=>{const marker=markersRef.current.get(keyOf(place));if(marker&&mapRef.current){mapRef.current.flyTo([Number(place.latitude),Number(place.longitude)],17,{duration:.45});window.setTimeout(()=>marker.openPopup(),500);}};

 useEffect(()=>{void refreshFavorites();if(configured)locate();},[configured,user?.id]);
 useEffect(()=>{
  if(!node.current||mapRef.current)return;
  try{
   const instance=L.map(node.current,{zoomControl:true,preferCanvas:true,zoomAnimation:false,fadeAnimation:false,markerZoomAnimation:false,attributionControl:true}).setView(DEFAULT_CENTER,11);
   mapRef.current=instance;layerRef.current=L.layerGroup().addTo(instance);providerIndex.current=0;activateProvider();
   const resize=()=>instance.invalidateSize({pan:false});
   const observer=new ResizeObserver(resize);observer.observe(node.current);window.addEventListener('resize',resize);document.addEventListener('visibilitychange',resize);requestAnimationFrame(resize);window.setTimeout(resize,100);window.setTimeout(resize,500);
   return()=>{observer.disconnect();window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',resize);if(fallbackTimer.current)window.clearTimeout(fallbackTimer.current);instance.remove();mapRef.current=null;layerRef.current=null;tileRef.current=null;};
  }catch(error){setMapInitError(error?.message||'The map could not be initialized.');}
 },[]);
 useEffect(()=>{renderMarkers();if(mapRef.current)window.setTimeout(()=>mapRef.current?.invalidateSize({pan:false}),30);},[visible,origin,favorites,navigate]);

 const categoryLegend=MAP_CATEGORIES.filter(item=>item.id!=='all');
 return <WorkspaceShell><section className="page-head map-surface">
  <div className="map-heading"><div><span className="eyebrow">Explore</span><h1>Map & location intelligence</h1><p>Fresh nearby discovery is shown as individual locations. Persisted Kleenest signals and live public-source discovery are merged.</p></div><button className="map-legend-toggle" onClick={()=>setShowLegend(v=>!v)}><Layers3 size={16}/>{showLegend?'Hide legend':'Show legend'}</button></div>
  <div className="map-toolbar"><input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&origin&&void loadNearby(origin[0],origin[1])} placeholder="Search nearby places, brands, amenities…"/><select value={category} onChange={e=>{const v=e.target.value;setCategory(v);if(origin)void loadNearby(origin[0],origin[1],{category:v});else locate();}}>{MAP_CATEGORIES.map(item=><option key={item.id} value={item.id}>{item.label}</option>)}</select><button className="button" disabled={busy} onClick={()=>origin?void loadNearby(origin[0],origin[1]):locate()}><Search size={16}/>Search</button><button className="button primary" disabled={busy} onClick={locate}><LocateFixed size={16}/>Use my location</button></div>
  <div className="map-filters"><button className={`map-chip ${verified?'active':''}`} onClick={()=>setVerified(v=>!v)}><CheckCircle2 size={15}/>Verified only</button><button className={`map-chip ${favoritesOnly?'active':''}`} onClick={()=>setFavoritesOnly(v=>!v)}><Heart size={15}/>Favorites</button><label className="map-chip"><SlidersHorizontal size={15}/>Radius<select value={radius} onChange={e=>{const v=Number(e.target.value);setRadius(v);try{localStorage.setItem('kleenest.map.radiusKm',String(v));}catch{}if(origin)void loadNearby(origin[0],origin[1],{radiusKm:v});}}>{RADII.map(v=><option key={v} value={v}>{v} km</option>)}</select></label><label className="map-chip">Amenity<select value={amenity} onChange={e=>setAmenity(e.target.value)}><option value="">Any</option>{AMENITIES.map(v=><option key={v} value={v}>{AMENITY_LABELS[v]}</option>)}</select></label></div>
  {showLegend&&<div className="map-legend-panel"><div><div className="map-legend-title">Location identity</div><div className="map-legend-group">{categoryLegend.map(item=><span key={item.id}><b className="legend-glyph">{item.label.slice(0,1)}</b>{item.label}</span>)}</div></div><div><div className="map-legend-title">Kleenest status</div><div className="map-legend-group"><span><b className="legend-status verified">✓</b>Verified</span><span><b className="legend-status open">●</b>Open</span><span><b className="legend-status premium">◆</b>Premium</span><span><b className="legend-status reported">•</b>Community reported</span><span><b className="legend-status favorite">♥</b>Favorite</span></div></div><div className="map-legend-note">Each result is an individual location. Business identity and Kleenest status are separate.</div></div>}
  <div className="map-status">{busy?'Working…':mapInitError?mapInitError:mapTileError?`${status} · map tiles switched to ${TILE_PROVIDERS[providerIndex.current].name}.`:status}</div>
  <div className="map-grid"><div className="map-canvas-wrap"><div className="map-canvas" ref={node}/><div className="map-map-hint"><Star size={14}/>Individual locations are always shown. Tap a marker for details, Route, Verify, or Favorite.</div></div><div className="map-results">{visible.slice(0,75).map(place=>{const id=keyOf(place),favorite=favorites.has(id),info=placeStatus(place);return <article className={`map-card ${id===keyOf(place)&&false?'selected':''}`} key={id} onClick={()=>focusPlace(place)}><div className="map-card-head"><div className="map-card-identity"><span className="map-card-glyph">{String(CATEGORY_GLYPHS[place.category]||'auto').slice(0,1)}</span><div><strong>{nameOf(place)}</strong>{placeBrand(place)&&placeBrand(place)!==nameOf(place)&&<small className="map-brand">{placeBrand(place)}</small>}</div></div><button className="button" onClick={e=>{e.stopPropagation();void toggleFavorite(place);}}>{favorite?'♥':'♡'}</button></div><div className="map-card-meta"><span className={`status-pill ${info.key}`}>{info.glyph} {info.label}</span>{distanceOf(place)&&<span>{distanceOf(place)}</span>}</div><div className="map-card-actions"><button className="button" onClick={e=>{e.stopPropagation();focusPlace(place);}}>Show on map</button><button className="button" onClick={e=>{e.stopPropagation();navigate(`/place/${encodeURIComponent(place.id||place.location_id)}`);}}>Details</button><button className="button" onClick={e=>{e.stopPropagation();navigate(`/route?origin=${encodeURIComponent(origin?`${origin[0]},${origin[1]}`:'')}&destination=${encodeURIComponent(`${place.latitude},${place.longitude}`)}&locationId=${encodeURIComponent(id)}`);}}><Navigation size={15}/>Route</button></div></article>})}{!visible.length&&<div className="map-empty"><h3>No nearby locations yet</h3><p>Use your location or expand the radius. Live discovery supplements the persisted Kleenest network when the local area has not been ingested yet.</p><button className="primary" onClick={locate}>Refresh nearby locations</button></div>}</div></div>
 </section></WorkspaceShell>;
}