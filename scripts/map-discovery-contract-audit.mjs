import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('src');
const required = [
  ['domains/maps/network.js', ['createMapNetworkService', 'map_network_nearby_v1', 'ingest-map-candidates-v3', 'prepare_universal_location_discovery', 'record_location_discovery_event', 'amenityNamesFrom']],
  ['domains/maps/networkDiscoveryPolicy.js', ['NETWORK_DISCOVERY_POLICY', 'collectOnOpen', 'enrichExisting', 'shareNetworkEvents']],
  ['runtime/MapSurface.jsx', ['MapSurfaceProduction']],
  ['runtime/MapSurfaceProduction.jsx', ['services.maps.nearby', 'discover', 'DEFAULT_CENTER', 'ready', 'visible', 'AMENITIES', './MapSurfaceV3.css']],
  ['AppContext.jsx', ['createMapNetworkService', 'maps:createMapNetworkService']],
];
const missing=[];const texts=new Map();
for(const[rel,tokens]of required){const file=path.join(root,rel);if(!fs.existsSync(file)){missing.push(`${rel}: file missing`);continue;}const text=fs.readFileSync(file,'utf8');texts.set(rel,text);for(const token of tokens)if(!text.includes(token))missing.push(`${rel}: missing ${token}`)}
const map=texts.get('domains/maps/network.js')||'';for(const forbidden of ['demoLocations','sampleLocations','mockLocations','fallbackDemo','demo accounts'])if(map.toLowerCase().includes(forbidden.toLowerCase()))missing.push(`domains/maps/network.js: forbidden demo fallback ${forbidden}`);
const surface=texts.get('runtime/MapSurfaceProduction.jsx')||'';for(const forbidden of ['demoLocations','sampleLocations','mockLocations','demo accounts','fakeLocations'])if(surface.toLowerCase().includes(forbidden.toLowerCase()))missing.push(`runtime/MapSurfaceProduction.jsx: forbidden demo fallback ${forbidden}`);
if(surface.includes('MAP_CATEGORIES.filter')||surface.includes('category selector'))missing.push('runtime/MapSurfaceProduction.jsx: map must not use location type as the primary discovery filter');
if(!/AMENITIES\.map\s*\(/.test(surface))missing.push('runtime/MapSurfaceProduction.jsx: amenity filter controls missing');
// The production surface supports multiple simultaneous amenities. The canonical request
// is therefore the object built from all selected amenities, while category remains `all`.
const amenityRequest=/amenities\s*:\s*(?:amenity\s*\?\s*\{\s*\[amenity\]\s*:\s*true\s*\}\s*:\s*\{\s*\}|amenityFilter)/.test(surface);
if(!amenityRequest||!/category\s*:\s*['"]all['"]/.test(surface))missing.push('runtime/MapSurfaceProduction.jsx: nearby request must be amenity-first with category=all');
if(!/discover\s*:\s*true/.test(surface))missing.push('runtime/MapSurfaceProduction.jsx: discover:true missing');
if(!/RADII=\[1,2,5,10,25,50\]/.test(surface))missing.push('runtime/MapSurfaceProduction.jsx: bounded radius options missing');
if(!surface.includes('amenityList')||!surface.includes('bathroomIntelligence'))missing.push('runtime/MapSurfaceProduction.jsx: canonical amenity projection missing');
if(!surface.includes('Game Center')||!surface.includes('/games'))missing.push('runtime/MapSurfaceProduction.jsx: missing Game Center CTA');
if(!surface.includes('map-legend-panel'))missing.push('runtime/MapSurfaceProduction.jsx: visible legend missing');
if(!map.includes('Array.isArray(discovered?.locations)'))missing.push('domains/maps/network.js: live discovery candidates must remain usable when persistence is unavailable');
if(!/p_amenity_names\s*:\s*amenityNames\.length\s*\?\s*amenityNames\s*:\s*null/.test(map))missing.push('domains/maps/network.js: canonical RPC must receive amenity filters');
if(!/amenity_names\s*:\s*amenityNames/.test(map))missing.push('domains/maps/network.js: live ingestion must receive amenity filters');
const context=texts.get('AppContext.jsx')||'';for(const forbidden of ['createUniversalDiscoveryService','universalDiscovery'])if(context.includes(forbidden))missing.push(`AppContext.jsx: redundant discovery service ${forbidden}`);
const nav=fs.readFileSync(path.join(root,'domain/workspaces.js'),'utf8');if(!nav.includes("id:'social',label:'Social',path:'/social'"))missing.push('domain/workspaces.js: social navigation entry missing');
if(missing.length){console.error(missing.join('\n'));process.exit(1)}console.log('Canonical Map discovery audit passed.');
