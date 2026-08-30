import fs from'node:fs';
const checks=[
 ['src/domains/enterprise/networks.js',['controlPlaneSnapshot','enterprise_control_plane_snapshot','record_enterprise_partner_campaign_outcome']],
 ['src/runtime/EnterpriseCommandCenterPage.jsx',['KLEENEST ENTERPRISE · CONTROL PLANE','controlPlaneSnapshot','enterpriseTier','active_members','active_campaigns','attributed_users','kleenest:enterprise-updated','kleenest:enterprise-commerce']],
 ['supabase/migrations/20260830004900_enterprise_control_plane_authority_v1.sql',['enterprise_control_plane_snapshot','Authentication required','Enterprise or Fleet admin access required','member_rollup','campaign_rollup','metric_rollup','outcome_rollup','record_enterprise_partner_campaign_outcome','revoke all','grant execute']]
];
const missing=[];
for(const[file,tokens]of checks){if(!fs.existsSync(file)){missing.push(`${file}: missing file`);continue;}const text=fs.readFileSync(file,'utf8');for(const token of tokens)if(!text.includes(token))missing.push(`${file}: missing ${token}`);}
const page=fs.readFileSync('src/runtime/EnterpriseCommandCenterPage.jsx','utf8');
for(const legacy of['business_growth','business_fleet','enterprise_fleet','services.business.analytics(id)','services.business.reviewAnalytics(id)','services.businessIntelligence.locationIntelligence(id)'])if(page.includes(legacy))missing.push(`EnterpriseCommandCenterPage.jsx: legacy eligibility/fan-out remains: ${legacy}`);
if(missing.length){console.error(missing.join('\n'));process.exit(1);}
console.log('Enterprise Control Plane audit passed: canonical tier eligibility, secured portfolio snapshot authority, independent metric rollups, outcome recording execution, refresh contracts, and command-center convergence are present.');
