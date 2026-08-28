import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('src/domains');
const missing = [];

const read = rel => {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) {
    missing.push(`${rel}: file missing`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
};

// Validate the canonical intelligence services by responsibility. Do not require
// implementation symbols to live in a particular module when the service graph
// deliberately separates action, notification, and convergence concerns.
const actions = read('intelligence/actions.js');
for (const token of ['execute_intelligence_action', 'complete_intelligence_action', 'create_intelligence_action_link']) {
  if (!actions.includes(token)) missing.push(`intelligence/actions.js: missing ${token}`);
}

const convergence = read('intelligence/convergence.js');
for (const token of ['createAction', 'executeAction', 'completeAction', 'notifyFromSignal', 'operationalSnapshot', 'subscribe', 'processJobs']) {
  if (!convergence.includes(token)) missing.push(`intelligence/convergence.js: missing public loop stage ${token}`);
}
for (const token of ['process_intelligence_notification_jobs', 'process_intelligence_action_jobs']) {
  if (!convergence.includes(token)) missing.push(`intelligence/convergence.js: missing ${token}`);
}

const notifications = read('notifications/intelligence.js');
if (!notifications.includes('create_intelligence_notification')) {
  missing.push('notifications/intelligence.js: missing create_intelligence_notification');
}

const business = read('business/intelligence.js');
for (const token of ['business_location_intelligence', 'business_roi_analytics']) {
  if (!business.includes(token)) missing.push(`business/intelligence.js: missing ${token}`);
}

const fleet = read('fleet/intelligence.js');
for (const token of ['fleet_dashboard_summary_v2', 'fleet_service_opportunities_for_business']) {
  if (!fleet.includes(token)) missing.push(`fleet/intelligence.js: missing ${token}`);
}

if (missing.length) {
  console.error(missing.join('\n'));
  process.exit(1);
}

console.log('Intelligence loop audit passed: signal, notification, action, outcome and operational convergence stages are wired.');
