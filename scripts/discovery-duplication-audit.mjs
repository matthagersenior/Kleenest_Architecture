import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('src');
const mapFile=path.join(root,'runtime/MapSurfaceV3.jsx');
const universalFile=path.join(root,'domains/discovery/universal.js');
const missing=[];
if(!fs.existsSync(mapFile)) missing.push('runtime/MapSurfaceV3.jsx missing');
if(!fs.existsSync(universalFile)) missing.push('domains/discovery/universal.js missing');
if(missing.length){console.error(missing.join('\n'));process.exit(1)}
const map=fs.readFileSync(mapFile,'utf8');
const universal=fs.readFileSync(universalFile,'utf8');
for(const token of ['services.maps.nearby','discover:true']) if(!map.includes(token)) missing.push(`MapSurfaceV3.jsx: missing canonical ${token}`);
for(const token of ["prepare_universal_location_discovery",'ingest-map-candidates-v3']) if(!universal.includes(token)) missing.push(`universal.js: missing compatibility ${token}`);
if(map.includes('createUniversalDiscoveryService')) missing.push('MapSurfaceV3.jsx must not instantiate universal discovery directly');
if(map.includes('prepare_universal_location_discovery')) missing.push('MapSurfaceV3.jsx must not call compatibility discovery RPC directly');
if(missing.length){console.error(missing.join('\n'));process.exit(1)}
console.log('Discovery ownership audit passed: Map owns canonical maps discovery; universal discovery remains a compatibility/ingestion layer.');
