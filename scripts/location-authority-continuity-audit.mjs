import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('src');
const authority = fs.readFileSync(path.join(root, 'domains/locations/authority.js'), 'utf8');
const details = fs.readFileSync(path.join(root, 'domains/locations/details.js'), 'utf8');

const requiredAuthority = ['locationAuthorityId','locationAuthorityCoordinates','projectLocationAuthority','locationAuthorityRoutePoint','source_provenance','raw_tags','location_id'];
for (const token of requiredAuthority) {
  if (!authority.includes(token)) throw new Error(`location authority contract missing: ${token}`);
}
for (const token of ['get_location_authority_bundle','projectLocationAuthority','offline']) {
  if (!details.includes(token)) throw new Error(`location details authority convergence missing: ${token}`);
}
const forbidden = [
  "client.from('places')",
  'client.from("places")',
  "client.from('locations')",
  'client.from("locations")',
  "client.from('location_intelligence_snapshot')",
  "client.from('reviews')",
  "client.from('review_photos')",
  "client.from('favorites')",
  "client.from('check_ins')",
];
for (const token of forbidden) {
  if (details.includes(token)) throw new Error(`duplicate location authority read remains in details.js: ${token}`);
}
console.log('location-authority-continuity-audit: PASS');
