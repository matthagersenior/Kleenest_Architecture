import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('src');
const required=[
  ['domains/maps/network.js',['createMapNetworkService','map_network_nearby_v1','ingest-map-candidates-v3','prepare_universal_location_discovery','record_location_discovery_event']],
  ['domains/maps/networkDiscoveryPolicy.js',['NETWORK_DISCOVERY_POLICY','collectOnOpen','enrichExisting','shareNetworkEvents']],
  ['runtime/MapSurfaceV3.jsx',['services.maps.nearby','discover:true','lastSuccessful','No locations found','kleenest.routeDraft.v1']],
  ['AppContext.jsx',['createMapNetworkService','maps:createMapNetworkService']]
];
const missing=[];
for(const [rel,tokens] of required){const file=path.join(root,rel);if(!fs.existsSync(file)){missing.push(`${rel}: file missing`);continue}const text=fs.readFileSync(file,'utf8');for(const token of tokens)if(!text.includes(token))missing.push(`${rel}: missing ${token}`)}
const map=fs.readFileSync(path.join(root,'domains/maps/network.js'),'utf8');
for(const forbidden of ['demoLocations','sampleLocations','mockLocations','fallbackDemo','demo accounts'])if(map.toLowerCase().includes(forbidden.toLowerCase()))missing.push(`domains/maps/network.js: forbidden demo fallback ${forbidden}`);
const surface=fs.readFileSync(path.join(root,'runtime/MapSurfaceV3.jsx'),'utf8');
for(const forbidden of ['demoLocations','sampleLocations','mockLocations','demo accounts','fakeLocations'])if(surface.toLowerCase().includes(forbidden.toLowerCase()))missing.push(`runtime/MapSurfaceV3.jsx: forbidden demo fallback ${forbidden}`);
const context=fs.readFileSync(path.join(root,'AppContext.jsx'),'utf8');
for(const forbidden of ['createUniversalDiscoveryService','universalDiscovery'])if(context.includes(forbidden))missing.push(`AppContext.jsx: redundant discovery service ${forbidden}`);
if(missing.length){console.error(missing.join('\n'));process.exit(1)}
console.log('Canonical Map discovery audit passed: canonical map service, bounded discovery/ingestion, telemetry, route continuity, non-demo fallback, and single discovery ownership are present.');
