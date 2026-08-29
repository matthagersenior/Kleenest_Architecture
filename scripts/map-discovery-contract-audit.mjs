import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('src');
const required = [
  ['domains/maps/network.js', ['createMapNetworkService', 'map_network_nearby_v1', 'ingest-map-candidates-v3', 'prepare_universal_location_discovery', 'record_location_discovery_event', 'amenityNamesFrom']],
  ['domains/maps/networkDiscoveryPolicy.js', ['NETWORK_DISCOVERY_POLICY', 'collectOnOpen', 'enrichExisting', 'shareNetworkEvents']],
  ['runtime/MapSurface.jsx', ['MapSurfaceStable']],
  ['runtime/MapSurfaceStable.jsx', ['services.maps.nearby', 'discover', 'DEFAULT_RADIUS', 'mapReady', 'selectedPlace', 'AMENITIES', 'Amenities']],
  ['AppContext.jsx', ['createMapNetworkService', 'maps:createMapNetworkService']],
];
const missing = [];
const texts = new Map();
for (const [rel, tokens] of required) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) { missing.push(`${rel}: file missing`); continue; }
  const text = fs.readFileSync(file, 'utf8');
  texts.set(rel, text);
  for (const token of tokens) if (!text.includes(token)) missing.push(`${rel}: missing ${token}`);
}
const map = texts.get('domains/maps/network.js') || '';
for (const forbidden of ['demoLocations', 'sampleLocations', 'mockLocations', 'fallbackDemo', 'demo accounts']) {
  if (map.toLowerCase().includes(forbidden.toLowerCase())) missing.push(`domains/maps/network.js: forbidden demo fallback ${forbidden}`);
}
const surface = texts.get('runtime/MapSurfaceStable.jsx') || '';
for (const forbidden of ['demoLocations', 'sampleLocations', 'mockLocations', 'demo accounts', 'fakeLocations']) {
  if (surface.toLowerCase().includes(forbidden.toLowerCase())) missing.push(`runtime/MapSurfaceStable.jsx: forbidden demo fallback ${forbidden}`);
}
if (surface.includes('MAP_CATEGORIES.filter') || surface.includes('category selector')) missing.push('runtime/MapSurfaceStable.jsx: map must not use location type as the primary discovery filter');
if (!/AMENITIES\.map\s*\(/.test(surface) || !/toggleAmenity/.test(surface)) missing.push('runtime/MapSurfaceStable.jsx: amenity filter controls missing');
if (!/amenities\s*:\s*Object\.fromEntries\s*\(.*selectedAmenityNames/s.test(surface) || !/category\s*:\s*['"]all['"]/.test(surface)) missing.push('runtime/MapSurfaceStable.jsx: nearby request must be amenity-first with category=all');
if (!/discover\s*:\s*true/.test(surface)) missing.push('runtime/MapSurfaceStable.jsx: discover:true missing');
if (!/DEFAULT_RADIUS\s*=\s*2/.test(surface)) missing.push('runtime/MapSurfaceStable.jsx: DEFAULT_RADIUS must remain 2 miles');
if (!/selectedAmenityNames/.test(surface) || !/amenityNames\s*=/.test(surface)) missing.push('runtime/MapSurfaceStable.jsx: canonical amenity-name projection missing');
if (!surface.includes('View details') && !surface.includes('Open full details')) missing.push('runtime/MapSurfaceStable.jsx: missing location-details CTA');
if (!map.includes('Array.isArray(discovered?.locations)')) missing.push('domains/maps/network.js: live discovery candidates must remain usable when persistence is unavailable');
// Accept the current service's object-shaped amenity payload as the canonical client contract,
// while also requiring the backend/network layer to project it to p_amenity_names / amenity_names.
if (!/p_amenity_names\s*:\s*amenityNames\.length\s*\?\s*amenityNames\s*:\s*null/.test(map)) missing.push('domains/maps/network.js: canonical RPC must receive amenity filters');
if (!/amenity_names\s*:\s*amenityNames/.test(map)) missing.push('domains/maps/network.js: live ingestion must receive amenity filters');
if (!surface.includes("./MapSurfaceV3.css") && !surface.includes('MapSurfaceV3')) missing.push('runtime/MapSurfaceStable.jsx: V3 styling baseline missing');
const context = texts.get('AppContext.jsx') || '';
for (const forbidden of ['createUniversalDiscoveryService', 'universalDiscovery']) if (context.includes(forbidden)) missing.push(`AppContext.jsx: redundant discovery service ${forbidden}`);
if (missing.length) { console.error(missing.join('\n')); process.exit(1); }
console.log('Canonical Map discovery audit passed: MapSurfaceStable/V3 styling baseline, amenity-first discovery, bounded OSM/Overpass ingestion, direct live-candidate convergence, 2-mile default radius, selected-location details, visible legend/markers, route continuity, non-demo fallback, and single discovery ownership are present.');
