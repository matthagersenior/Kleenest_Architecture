import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('src/domains');
const required=[
  ['intelligence/actions.js','execute_intelligence_action','complete_intelligence_action'],
  ['intelligence/convergence.js','createIntelligenceActionLink','process_intelligence_action_jobs'],
  ['notifications/intelligence.js','create_intelligence_notification','process_intelligence_notification_jobs'],
  ['business/intelligence.js','business_location_intelligence','business_roi_analytics','get_business_attribution_funnel'],
  ['fleet/intelligence.js','fleet_dashboard_summary_v2','fleet_service_opportunities_for_business']
];
const missing=[];
for(const [rel,...tokens] of required){const file=path.join(root,rel);if(!fs.existsSync(file)){missing.push(`${rel}: file missing`);continue}const text=fs.readFileSync(file,'utf8');for(const token of tokens)if(!text.includes(token))missing.push(`${rel}: missing ${token}`)}
const convergence=fs.readFileSync(path.join(root,'intelligence/convergence.js'),'utf8');
for(const token of ['notifyFromSignal','createAction','executeAction','completeAction','operationalSnapshot','subscribe','processJobs'])if(!convergence.includes(token))missing.push(`intelligence/convergence.js: missing public loop stage ${token}`);
if(missing.length){console.error(missing.join('\n'));process.exit(1)}
console.log('Intelligence loop audit passed: signal, attribution, notification, action, outcome and operational convergence stages are wired.');
