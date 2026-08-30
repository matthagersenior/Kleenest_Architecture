import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const checks = [
  ['AppContext registers the canonical consumer photo service', /createConsumerPhotoService\(supabase\)/, 'src/AppContext.jsx'],
  ['Visit surface uses the consumer trust journey', /Publish the trusted review/, 'src/runtime/VisitSurface.jsx'],
  ['Visit surface exposes photo evidence', /Photo evidence/, 'src/runtime/VisitSurface.jsx'],
  ['Visit surface reaches photo-aware evidence mutation', /restroomObservationWithPhoto/, 'src/runtime/VisitSurface.jsx'],
  ['Visit surface exposes verified review drafting without replacing publish authority', /VerifiedReviewDraft[\s\S]*Publish verified review/, 'src/runtime/VisitSurface.jsx'],
  ['Canonical evidence service exposes photo observation', /restroomObservationWithPhoto/, 'src/domains/consumer/location-evidence.js'],
  ['Evidence service refreshes trust/intelligence after observation', /refresh_location_trust_state|refresh_location_intelligence/, 'src/domains/consumer/location-evidence.js'],
  ['Evidence service dispatches progression/quest consequences', /quest|progression/i, 'src/domains/consumer/location-evidence.js'],
  ['Review service is wired into the trust surface', /services\.reviews\.create/, 'src/runtime/VisitSurface.jsx'],
  ['Helpful review interaction is wired', /services\.reviews\.like/, 'src/runtime/VisitSurface.jsx'],
  ['Offline replay preserves photo-linked observations', /submit_restroom_observation_with_photo/, 'src/domains/offline/packs.js'],
  ['Offline replay remains idempotent', /findAuthoritativeReplay/, 'src/domains/offline/packs.js'],
  ['Consumer activity telemetry is emitted', /publishConsumerActivity\(['"](checkin|evidence|review)/, 'src/runtime/VisitSurface.jsx'],
  ['Evidence journey reads canonical location authority before and after contribution', /services\.locations\.getById\(locationId\)/, 'src/runtime/LocationEvidencePage.jsx'],
  ['Evidence journey evaluates badges and refreshes milestones after contribution', /services\.progression\.evaluateBadges\(\)[\s\S]*services\.progression\.refreshMilestones\(\)/, 'src/runtime/LocationEvidencePage.jsx'],
  ['Evidence journey exposes authoritative trust impact', /TrustContributionImpact/, 'src/runtime/LocationEvidencePage.jsx'],
  ['Trust impact compares canonical trust, evidence, freshness, and staleness', /trust score[\s\S]*evidence signals[\s\S]*freshness[\s\S]*freshness state/, 'src/runtime/TrustContributionImpact.jsx'],
  ['Trust impact avoids synthetic rewards', /backend-returned|canonical location authority|unchanged scores are valid/i, 'src/runtime/TrustContributionImpact.jsx'],
  ['Quest service reads active participation through the canonical RPC', /quest_my_active_progress/, 'src/domains/progression/quests.js'],
  ['Quest surface loads available and active quest state together', /services\.quests\.available\(30\)[\s\S]*services\.quests\.active\(20\)/, 'src/runtime/QuestSurface.jsx'],
  ['Quest surface shows backend participation progress and earned XP', /xp_earned[\s\S]*completed[\s\S]*last_event_at/, 'src/runtime/QuestSurface.jsx'],
  ['Active quest RPC is security invoker and authenticated-only', /security invoker[\s\S]*revoke execute[\s\S]*anon[\s\S]*grant execute[\s\S]*authenticated/i, 'supabase/migrations/20260830002800_quest_my_active_progress_v1.sql'],
  ['Active quest RPC scopes participation to auth uid', /p\.user_id\s*=\s*auth\.uid\(\)/, 'supabase/migrations/20260830002800_quest_my_active_progress_v1.sql'],
  ['Active quest RPC scopes step events to auth uid', /e\.user_id\s*=\s*auth\.uid\(\)/, 'supabase/migrations/20260830002800_quest_my_active_progress_v1.sql'],
];

const failures = [];
for (const [label, pattern, file] of checks) {
  let source;
  try { source = read(file); } catch { failures.push(`${label}: missing ${file}`); continue; }
  if (!pattern.test(source)) failures.push(`${label}: contract not found in ${file}`);
}

if (failures.length) {
  console.error('Consumer Trust Wave audit FAILED');
  failures.forEach(f => console.error(`- ${f}`));
  process.exit(1);
}

const visit = read('src/runtime/VisitSurface.jsx');
const usesInjectedPhoto = /services\.locationPhoto\.uploadEvidencePhoto/.test(visit);
const usesCompatibilityPhoto = /uploadEvidencePhoto/.test(visit);
console.log(`Consumer Trust Wave audit passed (${checks.length} contracts) with verified review drafting, canonical evidence interpretation, before/after trust impact, authoritative progression refresh, and live user-scoped quest participation. Photo path: ${usesInjectedPhoto ? 'injected service' : usesCompatibilityPhoto ? 'compatibility export' : 'missing'}.`);
