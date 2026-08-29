import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const checks = [
  ['AppContext registers the canonical consumer photo service', /createConsumerPhotoService\(supabase\)/, 'src/AppContext.jsx'],
  ['Visit surface uses the consumer trust journey', /Publish the trusted review/, 'src/runtime/VisitSurface.jsx'],
  ['Visit surface exposes photo evidence', /Photo evidence/, 'src/runtime/VisitSurface.jsx'],
  ['Visit surface reaches photo-aware evidence mutation', /restroomObservationWithPhoto/, 'src/runtime/VisitSurface.jsx'],
  ['Canonical evidence service exposes photo observation', /restroomObservationWithPhoto/, 'src/domains/consumer/location-evidence.js'],
  ['Evidence service refreshes trust/intelligence after observation', /refreshTrust|refreshIntelligence/, 'src/domains/consumer/location-evidence.js'],
  ['Evidence service dispatches progression/quest consequences', /quest|progression/i, 'src/domains/consumer/location-evidence.js'],
  ['Review service is wired into the trust surface', /services\.reviews\.create/, 'src/runtime/VisitSurface.jsx'],
  ['Helpful review interaction is wired', /services\.reviews\.like/, 'src/runtime/VisitSurface.jsx'],
  ['Offline replay preserves photo-linked observations', /submit_restroom_observation_with_photo/, 'src/domains/offline/packs.js'],
  ['Offline replay remains idempotent', /findAuthoritativeReplay/, 'src/domains/offline/packs.js'],
  ['Consumer activity telemetry is emitted', /publishConsumerActivity\(['"](checkin|evidence|review)/, 'src/runtime/VisitSurface.jsx'],
];

const failures = [];
for (const [label, pattern, file] of checks) {
  let source;
  try { source = read(file); } catch { failures.push(`${label}: missing ${file}`); continue; }
  if (!pattern.test(source)) failures.push(`${label}: contract not found in ${file}`);
}

// Prevent a UI surface from silently bypassing the injected photo service.
const visit = read('src/runtime/VisitSurface.jsx');
if (/import\s*\{\s*uploadEvidencePhoto\s*\}\s*from\s*['"]\.\.\/domains\/consumer\/photo\.js['"]/.test(visit)) {
  failures.push('VisitSurface directly imports the legacy photo helper; use services.locationPhoto.uploadEvidencePhoto instead.');
}

if (failures.length) {
  console.error('Consumer Trust Wave audit FAILED');
  failures.forEach(f => console.error(`- ${f}`));
  process.exit(1);
}

console.log(`Consumer Trust Wave audit passed (${checks.length} contracts + legacy-bypass guard).`);
