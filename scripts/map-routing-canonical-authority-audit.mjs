import fs from 'node:fs';
import path from 'node:path';
const repo=path.resolve('.');
const src=path.join(repo,'src');
const errors=[];
const forbiddenRuntimeFiles=[
  'runtime/MapSurfaceProduction.jsx','runtime/MapSurfaceProductionFixed.jsx','runtime/MapSurfaceStable.jsx','runtime/MapSurfaceV2.jsx','runtime/MapSurfaceV3.jsx',
  'runtime/RouteSurfaceFixed.jsx','runtime/RouteSurfaceMobileFixed.jsx'
];
for(const rel of forbiddenRuntimeFiles)if(fs.existsSync(path.join(src,rel)))errors.push(`Competing runtime source still exists: src/${rel}`);
const required=['runtime/MapSurface.jsx','runtime/RouteSurface.jsx','runtime/CanonicalAppRuntime.jsx','AppContext.jsx','domains/maps/network.js','domains/routing/route.js'];
for(const rel of required)if(!fs.existsSync(path.join(src,rel)))errors.push(`Canonical authority missing: src/${rel}`);
if(!errors.length){
 const map=fs.readFileSync(path.join(src,'runtime/MapSurface.jsx'),'utf8');
 const route=fs.readFileSync(path.join(src,'runtime/RouteSurface.jsx'),'utf8');
 const runtime=fs.readFileSync(path.join(src,'runtime/CanonicalAppRuntime.jsx'),'utf8');
 const context=fs.readFileSync(path.join(src,'AppContext.jsx'),'utf8');
 const packageJson=fs.readFileSync(path.join(repo,'package.json'),'utf8');
 if(!map.includes("from 'maplibre-gl'"))errors.push('MapSurface.jsx must own the MapLibre renderer.');
 if(!map.includes('services?.maps?.nearby'))errors.push('MapSurface.jsx must consume services.maps.nearby.');
 if(/from ['\"]leaflet['\"]|from ['\"]react-leaflet['\"]|require\(['\"]leaflet['\"]\)/.test(map))errors.push('MapSurface.jsx must not use Leaflet.');
 if(!route.includes('services?.routing?.request'))errors.push('RouteSurface.jsx must consume services.routing.request.');
 if(!runtime.includes("import MapSurface from './MapSurface.jsx'"))errors.push('CanonicalAppRuntime must import only MapSurface.jsx.');
 if(!runtime.includes("import RouteSurface from './RouteSurface.jsx'"))errors.push('CanonicalAppRuntime must import only RouteSurface.jsx.');
 for(const token of ['<Route path="/map" element={<MapSurface/>}/>','<Route path="/discover" element={<MapSurface/>}/>','<Route path="/route" element={<RouteSurface/>}/>'])if(!runtime.includes(token))errors.push(`CanonicalAppRuntime missing canonical route binding: ${token}`);
 const mapFactories=(context.match(/createMapNetworkService\(/g)||[]).length;
 const routeFactories=(context.match(/createRoutingService\(/g)||[]).length;
 if(mapFactories!==1)errors.push(`AppContext must construct exactly one map service; found ${mapFactories}.`);
 if(routeFactories!==1)errors.push(`AppContext must construct exactly one routing service; found ${routeFactories}.`);
 const tiers=['free','premium','family','fleet','enterprise','business_standard','business_growth','business_fleet','business_enterprise'];
 for(const tier of tiers)if(!context.includes(`'${tier}'`))errors.push(`Membership tier missing from shared runtime authority: ${tier}`);
 const runtimeFiles=[];const walk=dir=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())walk(full);else if(/\.(jsx?|tsx?)$/.test(entry.name))runtimeFiles.push(full)}};walk(src);
 for(const file of runtimeFiles){if(file===path.join(src,'runtime/MapSurface.jsx'))continue;const text=fs.readFileSync(file,'utf8');if(/from ['\"]maplibre-gl['\"]/.test(text))errors.push(`MapLibre engine imported outside canonical MapSurface.jsx: ${path.relative(repo,file)}`);if(/from ['\"]leaflet['\"]|from ['\"]react-leaflet['\"]|require\(['\"]leaflet['\"]\)/.test(text))errors.push(`Legacy Leaflet runtime detected: ${path.relative(repo,file)}`);}
 if(packageJson.includes('"react-leaflet"'))errors.push('react-leaflet dependency must not return.');
}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log('Map/routing authority audit passed: one MapSurface, one RouteSurface, one map service, one routing service, MapLibre-only rendering, and the same canonical routes serve every membership tier.');
