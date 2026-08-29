import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('src');
const required=[
 ['domains/fleet/intelligence.js',['fleet_dashboard_summary_v2','fleet_service_opportunities_for_business','get_fleet_network_leaderboard']],
 ['domains/enterprise/intelligence.js',['get_enterprise_partner_network','get_partner_network_benchmark','get_partner_campaign_roi','get_partner_allocation_roi','record_enterprise_partner_metric','record_enterprise_partner_campaign_outcome']],
 ['domains/enterprise/lifecycle.js',['createCampaign','recordCampaignOutcome','recordNetworkMetric','createAllocation','activateAllocation','resolveContext']],
 ['domains/intelligence/convergence.js',['operationalSnapshot','operationalOpportunities','subscribe','processJobs']],
 ['runtime/FleetIntelligenceSurface.jsx',['services.fleet.intelligence','services.fleet.networkLeaderboard','kleenest:fleet-updated','kleenest:business-updated']],
 ['runtime/EnterpriseOperationsPage.jsx',['services.enterpriseIntelligence.getNetwork','services.enterpriseIntelligence.allocationRoi','recordCampaignOutcome','recordNetworkMetric']]
];
const missing=[];
for(const [rel,tokens] of required){const file=path.join(root,rel);if(!fs.existsSync(file)){missing.push(`${rel}: file missing`);continue}const text=fs.readFileSync(file,'utf8');for(const token of tokens)if(!text.includes(token))missing.push(`${rel}: missing ${token}`)}
const convergence=fs.readFileSync(path.join(root,'domains/intelligence/convergence.js'),'utf8');
for(const token of ['fleet_dashboard_summary_v2','fleet_service_opportunities_for_business','business_dashboard_secure_summary','business_location_intelligence','business_roi_analytics'])if(!convergence.includes(token))missing.push(`intelligence/convergence.js: missing ${token}`);
if(missing.length){console.error(missing.join('\n'));process.exit(1)}
console.log('Fleet → Enterprise → Network Intelligence static convergence audit passed.');
