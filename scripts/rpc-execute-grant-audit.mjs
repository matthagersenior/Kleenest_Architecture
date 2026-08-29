import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('supabase/migrations');
const files=fs.readdirSync(root).filter(f=>f.endsWith('.sql'));
const text=files.map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n');
const protectedRpcs=['get_business_attribution_funnel','business_roi_analytics','get_enterprise_partner_network','get_partner_network_benchmark','get_partner_campaign_roi','get_partner_allocation_roi','get_fleet_network_leaderboard','map_network_nearby_v1'];
const missing=[];
for(const fn of protectedRpcs){if(!text.includes(`revoke execute on function public.${fn}`))missing.push(`${fn}: missing explicit execute revoke`);if(!text.includes(`grant execute on function public.${fn}`))missing.push(`${fn}: missing explicit authenticated grant`);}
if(missing.length){console.error(missing.join('\n'));process.exit(1)}
console.log('RPC execute-grant audit passed for protected intelligence, attribution, Fleet, Enterprise, and Map functions.');
