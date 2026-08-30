import fs from 'node:fs';
import path from 'node:path';
const required=[
 ['supabase/functions/ai-assist/index.ts',['verify','OPENAI_API_KEY','gpt-5.6-luna','allowedTasks','review_required:true','grounded_fallback','business_growth','fleet_dispatch','visit_review','admin_moderation','route_plan']],
 ['src/domains/intelligence/convergence.js',["client.functions.invoke('ai-assist'",'aiAssist','kleenest:ai-assist-generated','review_required']],
 ['src/runtime/AiAssistPanel.jsx',['services.intelligenceConvergence.aiAssist','Review required before any change is applied','Grounded recommendation','Model-assisted recommendation']],
 ['src/runtime/FleetRouteStopPlanner.jsx',['AiAssistPanel','task="fleet_dispatch"','Fleet dispatch copilot']],
 ['src/runtime/BusinessGrowthEngagementPanel.jsx',['AiAssistPanel','task="business_growth"','Business growth copilot']],
 ['src/runtime/AdminReviewModerationPage.jsx',['AiAssistPanel','task="admin_moderation"','AI moderation triage','Do not recommend or make a final enforcement decision']],
 ['src/runtime/RouteSurfaceFixed.jsx',['AiAssistPanel','task="route_plan"','Route planning copilot','do not change the route automatically']]
];
const missing=[];
for(const [rel,tokens] of required){const file=path.resolve(rel);if(!fs.existsSync(file)){missing.push(`${rel}: missing file`);continue;}const text=fs.readFileSync(file,'utf8');for(const token of tokens)if(!text.includes(token))missing.push(`${rel}: missing ${token}`);}
const gateway=fs.readFileSync(path.resolve('supabase/functions/ai-assist/index.ts'),'utf8');
if(gateway.includes('VITE_')||gateway.includes('dangerouslyAllowBrowser'))missing.push('AI provider credentials must remain server-side');
if(!gateway.includes("supabaseAdmin.auth.getUser(token)"))missing.push('AI gateway must authenticate the caller');
if(missing.length){console.error('AI Assist convergence audit failed.');for(const item of missing)console.error(`- ${item}`);process.exit(1);}
console.log('AI Assist convergence audit passed: one authenticated gateway, centralized service boundary, grounded fallback, four product surfaces, and human review before mutations.');
