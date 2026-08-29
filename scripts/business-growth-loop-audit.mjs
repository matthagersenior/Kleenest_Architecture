import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('src');
const required=[
  ['domains/business/intelligence.js',['attributionFunnel','roi','executeAction']],
  ['domains/business/intelligence-recommendations.js',['buildBusinessRecommendations','rankBusinessRecommendations','action_type']],
  ['domains/intelligence/actions.js',['createLink','execute','complete']],
  ['domains/intelligence/convergence.js',['createAction','executeAction','completeAction','processJobs']],
  ['runtime/BusinessIntelligencePage.jsx',['locationIntelligence','actionLinks','buildBusinessRecommendations','BusinessIntelligenceActions']],
  ['runtime/BusinessIntelligenceActions.jsx',['executeAction','intelligence-action-completed','/business/reports/history','/business/reports']]
];

const missing=[];
for(const [rel,tokens] of required){
  const file=path.join(root,rel);
  if(!fs.existsSync(file)){missing.push(`${rel}: file missing`);continue;}
  const text=fs.readFileSync(file,'utf8');
  for(const token of tokens)if(!text.includes(token))missing.push(`${rel}: missing ${token}`);
}

const business=fs.readFileSync(path.join(root,'domains/business/intelligence.js'),'utf8');
for(const token of ['get_business_attribution_funnel','business_roi_analytics','business_manage_campaign','business_create_promotion'])if(!business.includes(token))missing.push(`business/intelligence.js: missing canonical contract ${token}`);

const page=fs.readFileSync(path.join(root,'runtime/BusinessIntelligencePage.jsx'),'utf8');
for(const token of ['kleenest:intelligence-updated','services.live.subscribe','state.actionLinks'])if(!page.includes(token))missing.push(`BusinessIntelligencePage.jsx: missing refresh contract ${token}`);

const actions=fs.readFileSync(path.join(root,'domains/intelligence/actions.js'),'utf8');
for(const token of ['execute_intelligence_action','complete_intelligence_action','create_intelligence_action_link'])if(!actions.includes(token))missing.push(`intelligence/actions.js: missing authoritative RPC ${token}`);

if(missing.length){console.error(missing.join('\n'));process.exit(1)}
console.log('Business growth loop audit passed: attribution, ROI, recommendation, authorization/action lifecycle, refresh, and reporting contracts are present.');
