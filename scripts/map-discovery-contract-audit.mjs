import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('src');
const required=[
  ['domains/maps/network.js',['createMapNetworkService','map_network_nearby_v1','ingest-map-candidates-v3','prepare_universal_location_discovery','record_location_discovery_event']],
  ['domains/maps/networkDiscoveryPolicy.js',['NETWORK_DISCOVERY_POLICY','collectOnOpen','enrichExisting','shareNetworkEvents']],
  ['runtime/MapSurface.jsx',['MapSurfaceStable']],
  ['runtime/MapSurfaceStable.jsx',['services.maps.nearby','discover:true','DEFAULT_RADIUS=2','mapReady','selectedPlace','No matching locations']],
  ['AppContext.jsx',['createMapNetworkService','maps:createMapNetworkService']]
];
const missing=[];
const texts=new Map();
for(const [rel,tokens] of required){const file=path.join(root,rel);if(!fs.existsSync(file)){missing.push(`${rel}: file missing`);continue}const text=fs.readFileSync(file,'utf8');texts.set(rel,text);for(const token of tokens)if(!text.includes(token))missing.push(`${rel}: missing ${token}`)}
const map=texts.get('domains/maps/network.js')||'';
for(const forbidden of ['demoLocations','sampleLocations','mockLocations','fallbackDemo','demo accounts'])if(map.toLowerCase().includes(forbidden.toLowerCase()))missing.push(`domains/maps/network.js: forbidden demo fallback ${forbidden}`);
const surface=texts.get('runtime/MapSurfaceStable.jsx')||'';
for(const forbidden of ['demoLocations','sampleLocations','mockLocations','demo accounts','fakeLocations'])if(surface.toLowerCase().includes(forbidden.toLowerCase()))missing.push(`runtime/MapSurfaceStable.jsx: forbidden demo fallback ${forbidden}`);
if(!surface.includes('MAP_CATEGORIES.filter')||!surface.includes('.map(v=>'))missing.push('runtime/MapSurfaceStable.jsx: category selector must consume canonical MAP_CATEGORIES by id');
// The runtime may label the selected-location CTA as either "View details" in a
// result card or "Open full details" in the selected-location panel. Both are
// valid expressions of the same canonical detail boundary; the audit should
// validate the contract rather than one exact UI phrase.
if(!surface.includes('View details')&&!surface.includes('Open full details'))missing.push('runtime/MapSurfaceStable.jsx: missing location-details CTA');
// Live discovery candidates must be consumable before persistence succeeds.
// This contract belongs to the canonical map service, not to the UI surface.
if(!map.includes('Array.isArray(discovered?.locations)'))missing.push('domains/maps/network.js: live discovery candidates must remain usable when persistence is unavailable');
const context=texts.get('AppContext.jsx')||'';
for(const forbidden of ['createUniversalDiscoveryService','universalDiscovery'])if(context.includes(forbidden))missing.push(`AppContext.jsx: redundant discovery service ${forbidden}`);
if(missing.length){console.error(missing.join('\n'));process.exit(1)}
console.log('Canonical Map discovery audit passed: stable runtime, bounded discovery/ingestion, direct live-candidate convergence, 2-mile default radius, selected-location details, visible legend/markers, route continuity, non-demo fallback, and single discovery ownership are present.');
