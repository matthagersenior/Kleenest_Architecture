import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('src/domains');
const required=[
  ['intelligence/actions.js','execute_intelligence_action','complete_intelligence_action'],
  ['intelligence/convergence.js','createIntelligenceActionLink','server_scheduled'],
  ['notifications/intelligence.js','create_intelligence_notification','process_intelligence_notification_jobs'],
  ['business/intelligence.js','business_location_intelligence','business_roi_analytics','get_business_attribution_funnel'],
  ['fleet/intelligence.js','fleet_dashboard_summary_v2','fleet_service_opportunities_for_business']
];
const missing=[];
for(const [rel,...tokens] of required){const file=path.join(root,rel);if(!fs.existsSync(file)){missing.push(`${rel}: file missing`);continue}const text=fs.readFileSync(file,'utf8');for(const token of tokens)if(!text.includes(token))missing.push(`${rel}: missing ${token}`)}
const convergence=fs.readFileSync(path.join(root,'intelligence/convergence.js'),'utf8');
for(const token of ['notifyFromSignal','createAction','executeAction','completeAction','operationalSnapshot','subscribe','processJobs','runOperationalLoop'])if(!convergence.includes(token))missing.push(`intelligence/convergence.js: missing public loop stage ${token}`);
if(convergence.includes("client.rpc('process_intelligence_action_jobs'")||convergence.includes("client.rpc('process_intelligence_notification_jobs'"))missing.push('intelligence/convergence.js: browser must not execute global intelligence job workers');
if(!convergence.includes("notifications:'server_scheduled'")||!convergence.includes("actions:'server_scheduled'"))missing.push('intelligence/convergence.js: missing explicit server-scheduled worker state');
if(missing.length){console.error(missing.join('\n'));process.exit(1)}
console.log('Intelligence loop audit passed: client signal/action surfaces are wired while global notification/action workers remain server-managed.');
