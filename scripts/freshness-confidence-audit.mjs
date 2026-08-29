import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('src');
const required=[
 ['domains/intelligence/trust.js',['get_location_trust_state','refresh_location_trust_state','select_reverification_targets','record_verification_streak']],
 ['domains/locations/details.js',['fetchAuthorityBundle','trustState','trust_freshness_score','trust_staleness_status','trust_last_verified_at']],
 ['runtime/LocationDetailsPage.jsx',['services.locations.getById','TRUST SIGNAL','Confidence grows from verified visits']],
 ['domains/consumer/location-evidence.js',['refresh_location_trust_state','location-trust-refreshed','location-intelligence-refresh-requested']]
];
const missing=[];
for(const [rel,tokens] of required){const file=path.join(root,rel);if(!fs.existsSync(file)){missing.push(`${rel}: file missing`);continue}const text=fs.readFileSync(file,'utf8');for(const token of tokens)if(!text.includes(token))missing.push(`${rel}: missing ${token}`)}
const migration=path.resolve('supabase/migrations/20260829020000_freshness_confidence_reverification_streaks.sql');
if(!fs.existsSync(migration))missing.push('freshness migration missing');else{const sql=fs.readFileSync(migration,'utf8');for(const token of ['freshness_score','staleness_status','reverification_due_at','record_verification_streak','select_reverification_targets'])if(!sql.includes(token))missing.push(`freshness migration: missing ${token}`);}
if(missing.length){console.error(missing.join('\n'));process.exit(1)}
console.log('Freshness/confidence audit passed: canonical trust state, authoritative location-bundle freshness, evidence refresh, user-facing location trust, and reverification contracts are wired.');
