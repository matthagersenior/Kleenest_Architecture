import fs from 'node:fs';
import path from 'node:path';
const migrations=path.resolve('supabase/migrations');
const required=['locations','check_ins','restroom_observations','reviews','route_stops','offline_pack_events','business_engagement_attributions','qr_attribution_events','enterprise_partner_networks','enterprise_partner_campaigns','enterprise_partner_campaign_outcomes','enterprise_partner_network_metrics','fleet_operational_events'];
const text=fs.readdirSync(migrations).filter(f=>f.endsWith('.sql')).map(f=>fs.readFileSync(path.join(migrations,f),'utf8')).join('\n');
const missing=[];
for(const t of required){if(!new RegExp(`alter\\s+table\\s+(?:public\\.)?${t}\\s+enable\\s+row\\s+level\\s+security`,`i`).test(text)) missing.push(`${t}: no migration-level RLS enable statement found`)}
for(const token of ['locations_public_select','checkins_own_select','offline_pack_events_owner','qr_attribution_read_own','enterprise_partner_networks_admin_read','fleet_operational_events_authorized_read']) if(!text.includes(token)) missing.push(`expected policy contract not found: ${token}`);
if(missing.length){console.error(missing.join('\n'));process.exit(1)}
console.log('RLS surface audit passed for canonical consumer/business/fleet/enterprise tables.');
