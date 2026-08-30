import fs from 'node:fs';
import path from 'node:path';
const repo=path.resolve('.');
const src=path.join(repo,'src');
const errors=[];
const forbiddenRuntimeFiles=[
  'runtime/MapSurfaceProduction.jsx','runtime/MapSurfaceProductionFixed.jsx','runtime/MapSurfaceStable.jsx','runtime/MapSurfaceV2.jsx','runtime/MapSurfaceV3.jsx',
  'runtime/RouteSurfaceFixed.jsx','runtime/RouteSurfaceMobileFixed.jsx'
];
const forbiddenMapStyles=['runtime/MapSurfaceV3.css','runtime/MapSurfaceProductionFixed.css','runtime/MapSurfacePolish.css'];
for(const rel of [...forbiddenRuntimeFiles,...forbiddenMapStyles])if(fs.existsSync(path.join(src,rel)))errors.push(`Competing runtime authority still exists: src/${rel}`);
const required=['runtime/MapSurface.jsx','runtime/MapSurface.css','runtime/MapMarkerSystem.jsx','runtime/osmPlaceData.js','runtime/RouteSurface.jsx','runtime/CanonicalAppRuntime.jsx','AppContext.jsx','domains/maps/network.js','domains/routing/route.js','domains/routing/cache.js'];
for(const rel of required)if(!fs.existsSync(path.join(src,rel)))errors.push(`Canonical authority missing: src/${rel}`);
if(!errors.length){
 const map=fs.readFileSync(path.join(src,'runtime/MapSurface.jsx'),'utf8');
 const mapCss=fs.readFileSync(path.join(src,'runtime/MapSurface.css'),'utf8');
 const marker=fs.readFileSync(path.join(src,'runtime/MapMarkerSystem.jsx'),'utf8');
 const placeData=fs.readFileSync(path.join(src,'runtime/osmPlaceData.js'),'utf8');
 const route=fs.readFileSync(path.join(src,'runtime/RouteSurface.jsx'),'utf8');
 const routing=fs.readFileSync(path.join(src,'domains/routing/route.js'),'utf8');
 const cache=fs.readFileSync(path.join(src,'domains/routing/cache.js'),'utf8');
 const runtime=fs.readFileSync(path.join(src,'runtime/CanonicalAppRuntime.jsx'),'utf8');
 const context=fs.readFileSync(path.join(src,'AppContext.jsx'),'utf8');
 const packageJson=fs.readFileSync(path.join(repo,'package.json'),'utf8');
 if(!map.includes("from 'maplibre-gl'"))errors.push('MapSurface.jsx must own the MapLibre renderer.');
 if(!map.includes("import './MapSurface.css'"))errors.push('MapSurface.jsx must import the canonical MapSurface.css.');
 const localMapCssImports=[...map.matchAll(/import\s+['"]\.\/MapSurface[^'"]*\.css['"]/g)].map(match=>match[0]);
 if(localMapCssImports.length!==1)errors.push(`MapSurface.jsx must import exactly one local map stylesheet; found ${localMapCssImports.length}.`);
 if(/MapSurface(?:V\d+|Production|Stable|Fixed|Polish)\.css/.test(map))errors.push('MapSurface.jsx must not import versioned or legacy map stylesheets.');
 if(/map-v\d|map-fixed-|production-fixed/i.test(map))errors.push('MapSurface.jsx must not expose generation-specific presentation classes.');
 if(!map.includes('className="page map-surface"'))errors.push('MapSurface.jsx must use the canonical map-surface root class.');
 if(/leaflet/i.test(mapCss))errors.push('MapSurface.css must not contain Leaflet-era selectors or rules.');
 for(const token of ['.map-surface','.map-canvas','.maplibre-host','.kleenest-maplibre-marker','.map-selection','.amenity-picker'])if(!mapCss.includes(token))errors.push(`MapSurface.css missing canonical presentation token: ${token}`);
 if(!map.includes('services?.maps?.nearby'))errors.push('MapSurface.jsx must consume services.maps.nearby.');
 if(/from ['\"]leaflet['\"]|from ['\"]react-leaflet['\"]|require\(['\"]leaflet['\"]\)/.test(map))errors.push('MapSurface.jsx must not use Leaflet.');
 if(!map.includes("el.className='kleenest-maplibre-anchor'"))errors.push('MapSurface markers must give MapLibre a transform-safe anchor wrapper.');
 if(!map.includes('class="kleenest-maplibre-marker'))errors.push('MapSurface marker visuals must live inside the MapLibre anchor wrapper.');
 if(!map.includes('navigationHref=place=>')||!map.includes('https://www.google.com/maps/dir/?api=1&destination='))errors.push('MapSurface must expose direct one-tap external navigation.');
 const navigateButtons=(map.match(/>Navigate now<\/a>/g)||[]).length;
 if(navigateButtons<2)errors.push(`MapSurface must expose Navigate now on pin selection and result cards; found ${navigateButtons}.`);
 if(!map.includes("searchParams.get('routeMode')==='stop'"))errors.push('MapSurface.jsx must use explicit query-based route handoff mode.');
 if(!map.includes('/route?add=')||!map.includes('/route?locationId='))errors.push('MapSurface.jsx must expose explicit stop and destination route contracts.');
 if(!map.includes("searchParams.get('routePreview')==='active'"))errors.push('MapSurface.jsx must own active-route preview mode.');
 for(const token of ['services?.routing?.cache?.getActive?.()','ROUTE_SOURCE','ROUTE_LAYER',"type:'geojson'","type:'line'"])if(!map.includes(token))errors.push(`MapSurface.jsx missing canonical route-preview token: ${token}`);
 if(!map.includes("from './osmPlaceData.js'"))errors.push('MapSurface.jsx must consume the canonical place identity resolver.');
 if(!map.includes('logos=placeLogoCandidates(place)')||!map.includes('if(logos[logoIndex])'))errors.push('MapSurface marker pins must retry the canonical logo candidate chain before fallback.');
 for(const token of ['BRAND_DOMAINS','BRAND_SLUGS','businessIdentity','domainFromPlace','placeLogoCandidates','cdn.simpleicons.org','contact:website','kleenest.map.identity.'])if(!placeData.includes(token))errors.push(`osmPlaceData.js missing canonical brand identity token: ${token}`);
 for(const forbidden of ['BRAND_DOMAINS','BRAND_SLUGS','brandIconCandidates','brandIconUrl','domainFromPlace','businessIdentity'])if(marker.includes(forbidden))errors.push(`MapMarkerSystem.jsx retains competing brand authority: ${forbidden}`);
 if(marker.includes('placeLogo(')||marker.includes('placeIconKey('))errors.push('MapMarkerSystem.jsx must not retain a competing logo/icon resolver.');
 if(!route.includes('services?.routing?.request'))errors.push('RouteSurface.jsx must consume services.routing.request.');
 if(route.includes('createRouteCache'))errors.push('RouteSurface.jsx must not construct route cache authority.');
 if(route.includes('kleenest.routeMapMode'))errors.push('RouteSurface.jsx must not use hidden localStorage route mode.');
 if(!route.includes('services?.routing?.cache'))errors.push('RouteSurface.jsx must consume the routing service cache authority.');
 if(!route.includes('to="/map?routeMode=stop"'))errors.push('RouteSurface.jsx must use explicit map stop-selection mode.');
 if(!route.includes('to="/map?routePreview=active"'))errors.push('RouteSurface.jsx must hand route visualization to canonical MapSurface.');
 if(!route.includes("active?.origin&&active?.destination&&active?.geometry"))errors.push('RouteSurface.jsx must recover built route geometry, not only persisted route IDs.');
 if(cache.includes('if (!route?.routeId) return route || null'))errors.push('Route cache must not require a persisted routeId before saving active geometry.');
 if(!cache.includes("if (!route?.origin || !route?.destination) return route || null"))errors.push('Route cache must validate built routes by origin/destination before active persistence.');
 if(!routing.includes('createRoutingService(client,{live=null,cache=null}={})'))errors.push('Routing service must accept canonical injected live/cache authorities.');
 if(!routing.includes('liveService=live||createLiveNetworkService(client)'))errors.push('Routing service must prefer injected Live Network authority.');
 if(!routing.includes('routeCache=cache||createRouteCache()'))errors.push('Routing service must own the route cache authority.');
 if(!context.includes('routing:createRoutingService(supabase,{live})'))errors.push('AppContext must inject the shared Live Network service into routing.');
 if(!runtime.includes("import MapSurface from './MapSurface.jsx'"))errors.push('CanonicalAppRuntime must import only MapSurface.jsx.');
 if(!runtime.includes("import RouteSurface from './RouteSurface.jsx'"))errors.push('CanonicalAppRuntime must import only RouteSurface.jsx.');
 for(const token of ['<Route path="/map" element={<MapSurface/>}/>','<Route path="/discover" element={<MapSurface/>}/>','<Route path="/route" element={<RouteSurface/>}/>'])if(!runtime.includes(token))errors.push(`CanonicalAppRuntime missing canonical route binding: ${token}`);
 const mapFactories=(context.match(/createMapNetworkService\(/g)||[]).length;
 const routeFactories=(context.match(/createRoutingService\(/g)||[]).length;
 const liveFactories=(context.match(/createLiveNetworkService\(/g)||[]).length;
 if(mapFactories!==1)errors.push(`AppContext must construct exactly one map service; found ${mapFactories}.`);
 if(routeFactories!==1)errors.push(`AppContext must construct exactly one routing service; found ${routeFactories}.`);
 if(liveFactories!==1)errors.push(`AppContext must construct exactly one Live Network service; found ${liveFactories}.`);
 const tiers=['free','premium','family','fleet','enterprise','business_standard','business_growth','business_fleet','business_enterprise'];
 for(const tier of tiers)if(!context.includes(`'${tier}'`))errors.push(`Membership tier missing from shared runtime authority: ${tier}`);
 const runtimeFiles=[];const walk=dir=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())walk(full);else if(/\.(jsx?|tsx?)$/.test(entry.name))runtimeFiles.push(full)}};walk(src);
 for(const file of runtimeFiles){if(file===path.join(src,'runtime/MapSurface.jsx'))continue;const text=fs.readFileSync(file,'utf8');if(/from ['\"]maplibre-gl['\"]/.test(text))errors.push(`MapLibre engine imported outside canonical MapSurface.jsx: ${path.relative(repo,file)}`);if(/from ['\"]leaflet['\"]|from ['\"]react-leaflet['\"]|require\(['\"]leaflet['\"]\)/.test(text))errors.push(`Legacy Leaflet runtime detected: ${path.relative(repo,file)}`);}
 if(packageJson.includes('"leaflet"')||packageJson.includes('"react-leaflet"'))errors.push('Legacy Leaflet dependencies must not return.');
}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log('Map/routing authority audit passed: one MapSurface and stylesheet, transform-safe geographically pinned markers, direct one-tap navigation, one canonical brand resolver, one RouteSurface, one map service, one routing service/cache/live authority, canonical active-route geometry preview, explicit map-to-route contracts, MapLibre-only rendering, and the same canonical routes serve every membership tier.');
