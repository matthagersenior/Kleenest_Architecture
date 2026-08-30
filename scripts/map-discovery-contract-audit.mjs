import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('src');
const required=[
 ['domains/maps/network.js',['createMapNetworkService','map_network_nearby_v1','ingest-map-candidates-v3','record_location_discovery_event','amenityNamesFrom']],
 ['domains/maps/networkDiscoveryPolicy.js',['NETWORK_DISCOVERY_POLICY','collectOnOpen','enrichExisting','shareNetworkEvents']],
 ['runtime/MapSurface.jsx',["from 'maplibre-gl'",'services?.maps?.nearby','discover:true',"category:'all'",'projectLocationAuthority','placeLogoCandidates','bathroomIntelligence','maplibregl.Marker','/route?add=','placeContact','placeHours','placeFreshness','compactFacts']],
 ['runtime/osmPlaceData.js',['raw_data?.osm_tags','source_metadata','placeHours','placeFreshness','amenityObject']],
 ['runtime/LocationDetailsPageFixed.jsx',['placeHours','placeFreshness','ADDRESS, HOURS & CONTACT','Show persisted OSM source tags']],
 ['domains/locations/details.js',['rawExternal?.osm_tags','latestExternal.last_seen_at','source_metadata: location?.source_metadata']],
 ['AppContext.jsx',['createMapNetworkService','maps:createMapNetworkService']]
];
const missing=[];const texts=new Map();
for(const[rel,tokens]of required){const file=path.join(root,rel);if(!fs.existsSync(file)){missing.push(`${rel}: file missing`);continue}const text=fs.readFileSync(file,'utf8');texts.set(rel,text);for(const token of tokens)if(!text.includes(token))missing.push(`${rel}: missing ${token}`)}
const edgePath=path.resolve('supabase/functions/ingest-map-candidates-v3/index.ts');
if(!fs.existsSync(edgePath))missing.push('supabase/functions/ingest-map-candidates-v3/index.ts: file missing');
else{
 const edge=fs.readFileSync(edgePath,'utf8');
 for(const token of ['out center tags','ingest_external_locations','SUPABASE_SERVICE_ROLE_KEY','source_metadata','osm_tags','opening_hours','contact:phone','contact:website','interactive-discovery-plus-canonical-persistence','provider_unavailable','canonical_fallback','PERSISTENCE_DEFERRED','LIVE_DISCOVERY_UNAVAILABLE','deferred: true'])if(!edge.includes(token))missing.push(`ingest-map-candidates-v3: missing ${token}`);
 for(const forbidden of ['scheduled-maps-ingest','interactive-discovery-only','stage:"acquisition_or_persistence"','DISCOVERY_FAILED'])if(edge.includes(forbidden))missing.push(`ingest-map-candidates-v3: obsolete fatal discovery coupling ${forbidden}`);
 if(!/if\s*\(!acquired\.ok\)[\s\S]*?return json\(\{[\s\S]*?ok:\s*true/.test(edge))missing.push('ingest-map-candidates-v3: acquisition outage must return a degraded HTTP 200 contract');
 if(!/const persistence = shouldPersist \? await persist\(locations\)/.test(edge))missing.push('ingest-map-candidates-v3: persistence must remain best-effort after live acquisition');
}
const map=texts.get('domains/maps/network.js')||'';
for(const forbidden of ['demoLocations','sampleLocations','mockLocations','fallbackDemo','demo accounts'])if(map.toLowerCase().includes(forbidden.toLowerCase()))missing.push(`domains/maps/network.js: forbidden demo fallback ${forbidden}`);
const surface=texts.get('runtime/MapSurface.jsx')||'';
for(const forbidden of ['demoLocations','sampleLocations','mockLocations','demo accounts','fakeLocations','createClient(','supabase.from(','supabase.rpc('])if(surface.toLowerCase().includes(forbidden.toLowerCase()))missing.push(`runtime/MapSurface.jsx: forbidden competing data path ${forbidden}`);
if(surface.includes('/route?locationId=')||surface.includes('/route?destinationLocationId='))missing.push('runtime/MapSurface.jsx: destination-specific route handoffs must not return');
if(!/amenities\s*:\s*Object\.fromEntries\(amenities\.map/.test(surface))missing.push('runtime/MapSurface.jsx: selected amenity filters must flow through the canonical map service');
if(!/category\s*:\s*['"]all['"]/.test(surface))missing.push('runtime/MapSurface.jsx: discovery must remain amenity-first with category=all');
if(!/discover\s*:\s*true/.test(surface))missing.push('runtime/MapSurface.jsx: discover:true missing');
if(!/RADII\s*=\s*\[1,2,5,10,25,50\]/.test(surface))missing.push('runtime/MapSurface.jsx: bounded radius options missing');
if(!surface.includes('map-legend-panel'))missing.push('runtime/MapSurface.jsx: visible map legend missing');
if(!surface.includes('LogoImage')||!surface.includes('placeLogoCandidates'))missing.push('runtime/MapSurface.jsx: canonical brand identity projection missing');
if(!surface.includes('bathroomIntelligence')||!surface.includes('bathroomSignalLabel'))missing.push('runtime/MapSurface.jsx: bathroom trust projection missing');
if(!map.includes('Array.isArray(discovered?.locations)'))missing.push('domains/maps/network.js: live discovery candidates must remain usable when persistence is unavailable');
if(!/p_amenity_names\s*:\s*amenityNames\.length\s*\?\s*amenityNames\s*:\s*null/.test(map))missing.push('domains/maps/network.js: canonical nearby RPC must receive amenity filters');
if(!/amenity_names\s*:\s*amenityNames/.test(map))missing.push('domains/maps/network.js: live ingestion must receive amenity filters');
const context=texts.get('AppContext.jsx')||'';for(const forbidden of ['createUniversalDiscoveryService','universalDiscovery'])if(context.includes(forbidden))missing.push(`AppContext.jsx: redundant discovery service ${forbidden}`);
if(missing.length){console.error(missing.join('\n'));process.exit(1)}
console.log('Canonical map discovery audit passed: live provider outages degrade to canonical results, persistence is best-effort, and rich Overpass data still projects through the single map authority.');
