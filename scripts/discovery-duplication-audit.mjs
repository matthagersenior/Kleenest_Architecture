import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('src');
const mapFile=path.join(root,'runtime/MapSurface.jsx');
const universalFile=path.join(root,'domains/discovery/universal.js');
const contextFile=path.join(root,'AppContext.jsx');
const missing=[];
for(const file of [mapFile,universalFile,contextFile])if(!fs.existsSync(file))missing.push(`${path.relative(root,file)} missing`);
if(missing.length){console.error(missing.join('\n'));process.exit(1)}
const map=fs.readFileSync(mapFile,'utf8');
const universal=fs.readFileSync(universalFile,'utf8');
const context=fs.readFileSync(contextFile,'utf8');
for(const token of ['services.maps.nearby','discover:true'])if(!map.includes(token))missing.push(`MapSurface.jsx: missing canonical ${token}`);
if(!universal.includes('prepare_universal_location_discovery'))missing.push('universal.js: missing canonical universal discovery RPC');
if(!universal.includes('map-bootstrap-ingest'))missing.push('universal.js: missing bounded compatibility ingestion path');
for(const token of ['createUniversalDiscoveryService','universalDiscovery'])if(context.includes(token))missing.push(`AppContext.jsx must not expose redundant discovery service: ${token}`);
if(map.includes('createUniversalDiscoveryService'))missing.push('MapSurface.jsx must not instantiate universal discovery directly');
if(map.includes('prepare_universal_location_discovery'))missing.push('MapSurface.jsx must not call compatibility discovery RPC directly');
if(missing.length){console.error(missing.join('\n'));process.exit(1)}
console.log('Discovery ownership audit passed: MapSurface.jsx owns canonical map discovery; universal discovery remains only the authenticated compatibility/ingestion boundary.');
